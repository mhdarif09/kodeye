import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { existsSync, readFileSync } from 'node:fs';

import { AppSettingsService } from '../../settings/app-settings.service';
import { AdminAuditService } from './admin-audit.service';

type ProviderName = 'github' | 'midtrans' | 'paypal' | 'currency';

@Injectable()
export class ProviderTestService {
  constructor(
    private readonly audit: AdminAuditService,
    private readonly settings: AppSettingsService,
  ) {}

  async test(provider: ProviderName, actorUserId: string) {
    let result: {
      missingKeys: string[];
      message: string;
      status: 'success' | 'warning' | 'error';
    };
    if (provider === 'github') result = this.testGithub();
    else if (provider === 'midtrans') result = this.testMidtrans();
    else if (provider === 'paypal') result = await this.testPaypal();
    else result = await this.testCurrency();
    await this.audit.createTestLog(
      actorUserId,
      provider,
      result.status !== 'error',
    );
    return result;
  }

  private testGithub() {
    const missingKeys = this.missing([
      'GITHUB_OAUTH_CLIENT_ID',
      'GITHUB_OAUTH_CLIENT_SECRET',
      'GITHUB_APP_ID',
      'GITHUB_APP_PRIVATE_KEY_PATH',
      'GITHUB_APP_WEBHOOK_SECRET',
    ]);
    if (missingKeys.length) {
      return {
        missingKeys,
        message: 'GitHub credentials are incomplete.',
        status: 'error' as const,
      };
    }
    try {
      jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 60,
          iat: Math.floor(Date.now() / 1000) - 60,
          iss: this.settings.getString('GITHUB_APP_ID'),
        },
        readPrivateKey(this.settings.getString('GITHUB_APP_PRIVATE_KEY_PATH')),
        { algorithm: 'RS256' },
      );
    } catch {
      return {
        missingKeys: [],
        message: 'GitHub App private key is configured but invalid.',
        status: 'error' as const,
      };
    }
    return {
      missingKeys: [],
      message:
        'GitHub credentials are configured and the App JWT can be signed.',
      status: 'success' as const,
    };
  }

  private testMidtrans() {
    const missingKeys = this.missing([
      'MIDTRANS_SERVER_KEY',
      'MIDTRANS_CLIENT_KEY',
      'MIDTRANS_IS_PRODUCTION',
    ]);
    if (missingKeys.length) {
      return {
        missingKeys,
        message: 'Midtrans credentials are incomplete.',
        status: 'error' as const,
      };
    }
    return {
      missingKeys: [],
      message:
        'Midtrans credentials are configured. Live transaction test is not performed.',
      status: 'warning' as const,
    };
  }

  private async testPaypal() {
    const missingKeys = this.missing([
      'PAYPAL_CLIENT_ID',
      'PAYPAL_CLIENT_SECRET',
      'PAYPAL_ENVIRONMENT',
    ]);
    if (missingKeys.length) {
      return {
        missingKeys,
        message: 'PayPal credentials are incomplete.',
        status: 'error' as const,
      };
    }
    const environment = this.settings.getString(
      'PAYPAL_ENVIRONMENT',
      'sandbox',
    );
    const base =
      environment === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
    try {
      const response = await fetch(`${base}/v1/oauth2/token`, {
        body: 'grant_type=client_credentials',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${this.settings.getString('PAYPAL_CLIENT_ID')}:${this.settings.getSecret(
              'PAYPAL_CLIENT_SECRET',
            )}`,
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      });
      if (!response.ok) throw new Error('PayPal auth failed');
      return {
        missingKeys: [],
        message: 'PayPal OAuth token request succeeded.',
        status: 'success' as const,
      };
    } catch {
      return {
        missingKeys: [],
        message: 'PayPal credentials are configured, but OAuth test failed.',
        status: 'warning' as const,
      };
    }
  }

  private async testCurrency() {
    if (!this.settings.getBoolean('BILLING_USE_LIVE_CURRENCY', true)) {
      return {
        missingKeys: [],
        message: 'Live currency is disabled.',
        status: 'warning' as const,
      };
    }
    try {
      const response = await fetch(
        'https://api.frankfurter.app/latest?from=USD&to=IDR',
      );
      if (!response.ok) throw new Error('FX failed');
      return {
        missingKeys: [],
        message: 'Currency provider responded successfully.',
        status: 'success' as const,
      };
    } catch {
      return {
        missingKeys: [],
        message:
          'Currency provider is unavailable. Checkout can still use cached rates if configured.',
        status: 'warning' as const,
      };
    }
  }

  private missing(keys: string[]) {
    return keys.filter((key) => !this.settings.getString(key));
  }
}

function readPrivateKey(path: string) {
  if (!path || !existsSync(path)) throw new Error('Private key file not found');
  const key = readFileSync(path, 'utf8');
  if (!key.includes('BEGIN')) throw new Error('Invalid private key file');
  return key;
}
