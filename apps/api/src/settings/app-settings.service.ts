import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuditAction,
  Prisma,
  SettingCategory,
  SettingValueType,
} from '@prisma/client';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import {
  ENV_ONLY_SETTING_KEYS,
  SETTING_DEFINITIONS,
  SETTING_KEYS,
  getSettingDefinition,
} from './setting-definitions';

interface AuditContext {
  actorUserId?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AppSettingsService implements OnModuleInit {
  private readonly logger = new Logger(AppSettingsService.name);
  private readonly cache = new Map<string, string>();
  private cacheLoadedAt = 0;
  private readonly encryptionKey: Buffer;
  private readonly keyVersion: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.keyVersion =
      this.config.get<string>('SETTINGS_ENCRYPTION_KEY_VERSION') || 'v1';
    this.encryptionKey = this.resolveEncryptionKey();
  }

  async onModuleInit() {
    await this.seedDefinitions();
    await this.reload();
  }

  async reload() {
    this.cache.clear();
    const settings = await this.prisma.appSetting.findMany({
      where: { isActive: true },
    });
    for (const setting of settings) {
      const definition = getSettingDefinition(setting.key);
      try {
        if (setting.isSecret || setting.valueType === SettingValueType.SECRET) {
          if (
            setting.encryptedValue &&
            setting.encryptionIv &&
            setting.encryptionTag
          ) {
            this.cache.set(
              setting.key,
              this.decrypt({
                encrypted: setting.encryptedValue,
                iv: setting.encryptionIv,
                tag: setting.encryptionTag,
              }),
            );
          }
        } else if (setting.value !== null) {
          this.cache.set(setting.key, setting.value);
        }
      } catch {
        this.logger.warn(`Ignoring unreadable setting ${setting.key}`);
      }
      if (!definition) this.logger.warn(`Unknown setting key ${setting.key}`);
    }

    // Legacy Phase 9 table fallback. New writes use app_settings.
    const legacy = await this.prisma.systemSetting.findMany();
    for (const setting of legacy) {
      if (this.cache.has(setting.key)) continue;
      try {
        this.cache.set(setting.key, this.decryptLegacy(setting.encryptedValue));
      } catch {
        this.logger.warn(`Ignoring unreadable legacy setting ${setting.key}`);
      }
    }
    this.cacheLoadedAt = Date.now();
  }

  get<T = string>(key: string, fallback?: T): T {
    void this.refreshCacheIfExpired();
    const stored = this.cache.get(key);
    if (stored !== undefined) return stored as T;
    const env = this.config.get<T>(key);
    if (env !== undefined && env !== '') return env;
    const definition = getSettingDefinition(key);
    if (definition?.defaultValue !== undefined) {
      return definition.defaultValue as T;
    }
    return fallback as T;
  }

  getString(key: string, fallback = '') {
    return this.get<string>(key, fallback);
  }

  getSecret(key: string, fallback = '') {
    return this.get<string>(key, fallback);
  }

  getNumber(key: string, fallback = 0) {
    const value = this.get<string>(key);
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  getBoolean(key: string, fallback = false) {
    const value = this.get<string>(key);
    if (value === undefined || value === null || value === '') return fallback;
    return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
  }

  getJson<T = unknown>(key: string, fallback: T): T {
    const value = this.get<string>(key);
    if (!value) return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  getMany(keys: string[]) {
    return Object.fromEntries(keys.map((key) => [key, this.get<string>(key)]));
  }

  getOrThrow(key: string): string {
    const value = this.get<string>(key);
    if (!value) throw new BadRequestException(`${key} is not configured`);
    return value;
  }

  async list(category?: SettingCategory | string, search?: string) {
    await this.refreshCacheIfExpired();
    const normalizedSearch = search?.toLowerCase();
    const rows = await this.prisma.appSetting.findMany({
      include: { updatedBy: { select: { email: true, id: true, name: true } } },
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
    const rowByKey = new Map(rows.map((row) => [row.key, row]));

    return SETTING_DEFINITIONS.filter((definition) => {
      if (category && definition.category !== category) return false;
      if (!normalizedSearch) return true;
      return (
        definition.key.toLowerCase().includes(normalizedSearch) ||
        definition.label.toLowerCase().includes(normalizedSearch) ||
        definition.description.toLowerCase().includes(normalizedSearch)
      );
    }).map((definition) => {
      const row = rowByKey.get(definition.key);
      const databaseValue = this.cache.get(definition.key);
      const env = this.config.get<string>(definition.envKey ?? definition.key);
      const effective =
        databaseValue ?? env ?? definition.defaultValue ?? undefined;
      const source =
        databaseValue !== undefined
          ? 'database'
          : env
            ? 'environment'
            : definition.defaultValue !== undefined
              ? 'default'
              : 'none';
      return {
        ...definition,
        configured: Boolean(effective),
        isActive: row?.isActive ?? true,
        maskedValue: definition.isSecret ? mask(effective) : undefined,
        sensitive: definition.isSecret,
        source,
        updatedAt: row?.updatedAt ?? null,
        updatedBy: row?.updatedBy ?? null,
        value: definition.isSecret ? mask(effective) : (effective ?? ''),
      };
    });
  }

  async getPublicSetting(key: string) {
    if (!SETTING_KEYS.has(key))
      throw new BadRequestException(`Setting ${key} is not supported`);
    return (await this.list()).find((setting) => setting.key === key);
  }

  async update(values: Record<string, string | null>, userId: string) {
    return this.bulkUpdate(values, { actorUserId: userId });
  }

  async bulkUpdate(values: Record<string, string | null>, context: AuditContext) {
    this.assertValidPayload(values);
    await this.prisma.$transaction(async (transaction) => {
      for (const [key, value] of Object.entries(values)) {
        const definition = getSettingDefinition(key);
        if (!definition) throw new BadRequestException(`Unsupported ${key}`);

        if (value === null) {
          await transaction.appSetting.updateMany({
            data: {
              encryptedValue: null,
              encryptionIv: null,
              encryptionTag: null,
              value: null,
              updatedByUserId: context.actorUserId,
            },
            where: { key },
          });
          await transaction.systemSetting.deleteMany({ where: { key } });
          await transaction.adminAuditLog.create({
            data: this.auditData(AuditAction.CLEAR_SECRET, key, context),
          });
          continue;
        }

        if (value === '' || value.includes('********')) continue;

        const encrypted = definition.isSecret ? this.encrypt(value) : null;
        await transaction.appSetting.upsert({
          create: {
            category: definition.category,
            description: definition.description,
            encryptedValue: encrypted?.encrypted,
            encryptionIv: encrypted?.iv,
            encryptionTag: encrypted?.tag,
            isSecret: Boolean(definition.isSecret),
            key,
            keyVersion: encrypted?.keyVersion,
            updatedByUserId: context.actorUserId,
            value: definition.isSecret ? null : value,
            valueType: definition.valueType,
          },
          update: {
            category: definition.category,
            description: definition.description,
            encryptedValue: encrypted?.encrypted,
            encryptionIv: encrypted?.iv,
            encryptionTag: encrypted?.tag,
            isActive: true,
            isSecret: Boolean(definition.isSecret),
            keyVersion: encrypted?.keyVersion,
            updatedByUserId: context.actorUserId,
            value: definition.isSecret ? null : value,
            valueType: definition.valueType,
          },
          where: { key },
        });
        await transaction.adminAuditLog.create({
          data: this.auditData(AuditAction.UPDATE, key, context, {
            isSecret: Boolean(definition.isSecret),
            valueType: definition.valueType,
          }),
        });
      }
    });
    await this.reload();
    return this.list();
  }

  async updateOne(
    key: string,
    value: string,
    isActive: boolean | undefined,
    context: AuditContext,
  ) {
    await this.bulkUpdate({ [key]: value }, context);
    if (isActive !== undefined) {
      await this.prisma.appSetting.update({
        data: { isActive },
        where: { key },
      });
      await this.reload();
    }
    return this.getPublicSetting(key);
  }

  async clearSecret(key: string, context: AuditContext) {
    const definition = getSettingDefinition(key);
    if (!definition?.isSecret)
      throw new BadRequestException(`${key} is not a secret setting`);
    await this.prisma.$transaction([
      this.prisma.appSetting.updateMany({
        data: {
          encryptedValue: null,
          encryptionIv: null,
          encryptionTag: null,
          updatedByUserId: context.actorUserId,
        },
        where: { key },
      }),
      this.prisma.systemSetting.deleteMany({ where: { key } }),
      this.prisma.adminAuditLog.create({
        data: this.auditData(AuditAction.CLEAR_SECRET, key, context),
      }),
    ]);
    await this.reload();
    return this.getPublicSetting(key);
  }

  async auditReload(context: AuditContext) {
    await this.reload();
    await this.prisma.adminAuditLog.create({
      data: this.auditData(AuditAction.SETTINGS_RELOAD, 'settings', context),
    });
    return { ok: true };
  }

  private async seedDefinitions() {
    for (const definition of SETTING_DEFINITIONS) {
      await this.prisma.appSetting.upsert({
        create: {
          category: definition.category,
          description: definition.description,
          isSecret: Boolean(definition.isSecret),
          key: definition.key,
          valueType: definition.valueType,
        },
        update: {
          category: definition.category,
          description: definition.description,
          isSecret: Boolean(definition.isSecret),
          valueType: definition.valueType,
        },
        where: { key: definition.key },
      });
    }
  }

  private assertValidPayload(values: Record<string, string | null>) {
    for (const [key, value] of Object.entries(values)) {
      if (!SETTING_KEYS.has(key) || ENV_ONLY_SETTING_KEYS.has(key)) {
        throw new BadRequestException(`Setting ${key} is not supported`);
      }
      if (value === null || value === '' || value.includes('********')) {
        continue;
      }
      const definition = getSettingDefinition(key);
      if (!definition) throw new BadRequestException(`Unsupported ${key}`);
      if (definition.valueType === SettingValueType.NUMBER) {
        const number = Number(value);
        if (!Number.isFinite(number))
          throw new BadRequestException(`${key} must be numeric`);
        if (key === 'BILLING_DEFAULT_TAX_RATE' && (number < 0 || number > 1)) {
          throw new BadRequestException(`${key} must be between 0 and 1`);
        }
      }
      if (
        definition.valueType === SettingValueType.BOOLEAN &&
        !['true', 'false', '1', '0', 'yes', 'no', 'on', 'off'].includes(
          value.toLowerCase(),
        )
      ) {
        throw new BadRequestException(`${key} must be boolean`);
      }
      if (definition.valueType === SettingValueType.JSON) {
        try {
          JSON.parse(value);
        } catch {
          throw new BadRequestException(`${key} must be valid JSON`);
        }
      }
      if (key.includes('URL') && !isUrl(value)) {
        throw new BadRequestException(`${key} must be a valid URL`);
      }
      if (key.includes('CURRENCY') && !/^[A-Z]{3}(,[A-Z]{3})*$/.test(value)) {
        throw new BadRequestException(`${key} must use ISO currency codes`);
      }
      if (
        key === 'GITHUB_APP_PRIVATE_KEY' &&
        !value.includes('BEGIN') &&
        !value.includes('\\n') &&
        !/^[A-Za-z0-9+/=]+$/.test(value)
      ) {
        throw new BadRequestException(`${key} must look like PEM or base64`);
      }
    }
  }

  private auditData(
    action: AuditAction,
    key: string,
    context: AuditContext,
    metadataJson?: Prisma.InputJsonObject,
  ): Prisma.AdminAuditLogUncheckedCreateInput {
    return {
      action,
      actorUserId: context.actorUserId,
      ipAddress: context.ipAddress,
      metadataJson,
      resourceKey: key,
      resourceType: 'setting',
      userAgent: context.userAgent,
    };
  }

  private encrypt(value: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    return {
      encrypted: encrypted.toString('base64url'),
      iv: iv.toString('base64url'),
      keyVersion: this.keyVersion,
      tag: cipher.getAuthTag().toString('base64url'),
    };
  }

  private decrypt(input: { encrypted: string; iv: string; tag: string }) {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(input.iv, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(input.tag, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(input.encrypted, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  private decryptLegacy(value: string) {
    const [version, iv, tag, encrypted] = value.split('.');
    if (version !== 'v1' || !iv || !tag || !encrypted)
      throw new Error('Invalid encrypted setting');
    return this.decrypt({ encrypted, iv, tag });
  }

  private resolveEncryptionKey() {
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';
    const settingsKey = this.config.get<string>('SETTINGS_ENCRYPTION_KEY');
    if (isProduction && !settingsKey) {
      throw new Error('SETTINGS_ENCRYPTION_KEY is required in production');
    }
    const configured =
      settingsKey ||
      this.config.get<string>('APP_SETTINGS_ENCRYPTION_KEY') ||
      this.config.get<string>('JWT_SECRET');
    if (!configured) {
      throw new Error('SETTINGS_ENCRYPTION_KEY or JWT_SECRET is required');
    }
    const parsed = parseKey(configured);
    if (parsed) return parsed;
    if (isProduction) {
      throw new Error('SETTINGS_ENCRYPTION_KEY must be 32 bytes, hex, or base64');
    }
    this.logger.warn(
      'SETTINGS_ENCRYPTION_KEY is not 32 bytes; deriving a development key with SHA-256.',
    );
    return createHash('sha256').update(configured).digest();
  }

  private async refreshCacheIfExpired() {
    const ttl =
      Number(this.config.get<string>('SETTINGS_CACHE_TTL_SECONDS')) || 60;
    if (Date.now() - this.cacheLoadedAt > ttl * 1000) {
      await this.reload();
    }
  }
}

function parseKey(value: string): Buffer | null {
  if (/^[a-f0-9]{64}$/i.test(value)) {
    const hex = Buffer.from(value, 'hex');
    if (hex.length === 32) return hex;
  }
  try {
    const base64 = Buffer.from(value, 'base64');
    if (base64.length === 32) return base64;
  } catch {
    // Try raw bytes next.
  }
  const raw = Buffer.from(value, 'utf8');
  return raw.length === 32 ? raw : null;
}

function mask(value?: string) {
  if (!value) return '';
  if (value.includes('BEGIN') || value.length > 120) return 'Configured';
  if (value.length < 8) return '********';
  return `${value.slice(0, 3)}********${value.slice(-4)}`;
}

function isUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
