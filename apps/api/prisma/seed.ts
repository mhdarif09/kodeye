import {
  PrismaClient,
  CouponType,
  PlanInterval,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcrypt';

import { SETTING_DEFINITIONS } from '../src/settings/setting-definitions';

const prisma = new PrismaClient();

async function main() {
  const currencies = [
    ['IDR', 'Indonesian Rupiah', 'Rp', 0, true, true, false],
    ['USD', 'US Dollar', '$', 2, false, false, true],
    ['EUR', 'Euro', 'EUR', 2, false, false, true],
    ['SGD', 'Singapore Dollar', 'S$', 2, false, false, true],
  ] as const;
  for (const [
    code,
    name,
    symbol,
    minorUnit,
    isDefault,
    midtrans,
    paypal,
  ] of currencies) {
    await prisma.currency.upsert({
      create: {
        code,
        isDefault,
        minorUnit,
        name,
        supportedByMidtrans: midtrans,
        supportedByPaypal: paypal,
        symbol,
      },
      update: {
        isDefault,
        minorUnit,
        name,
        supportedByMidtrans: midtrans,
        supportedByPaypal: paypal,
        symbol,
      },
      where: { code },
    });
  }
  const plans = [
    {
      basePriceIdr: 0,
      code: 'free',
      enableGithubAutoScan: false,
      enablePdfReport: false,
      enableRecurring: false,
      interval: PlanInterval.MONTHLY,
      isEnterprise: false,
      maxRepositories: 1,
      maxScansPerMonth: 5,
      name: 'Free',
      requiresManualApproval: false,
    },
    {
      basePriceIdr: 99000,
      code: 'pro_monthly',
      enableGithubAutoScan: true,
      enablePdfReport: true,
      enableRecurring: true,
      interval: PlanInterval.MONTHLY,
      isEnterprise: false,
      maxRepositories: 10,
      maxScansPerMonth: 100,
      name: 'Pro Monthly',
      requiresManualApproval: false,
    },
    {
      basePriceIdr: 299000,
      code: 'team_monthly',
      enableGithubAutoScan: true,
      enablePdfReport: true,
      enableRecurring: true,
      interval: PlanInterval.MONTHLY,
      isEnterprise: false,
      maxRepositories: 50,
      maxScansPerMonth: 500,
      name: 'Team Monthly',
      requiresManualApproval: false,
    },
    {
      basePriceIdr: null,
      code: 'enterprise_custom',
      enableGithubAutoScan: true,
      enablePdfReport: true,
      enableRecurring: false,
      interval: PlanInterval.CUSTOM,
      isEnterprise: true,
      maxRepositories: 1000,
      maxScansPerMonth: 10000,
      name: 'Enterprise Custom',
      requiresManualApproval: true,
    },
  ];
  for (const plan of plans) {
    const saved = await prisma.plan.upsert({
      create: plan,
      update: plan,
      where: { code: plan.code },
    });
    if (plan.code === 'free') {
      for (const [code] of currencies)
        await prisma.planPrice.upsert({
          create: { amount: 0, currencyCode: code, planId: saved.id },
          update: { amount: 0 },
          where: {
            planId_currencyCode: { currencyCode: code, planId: saved.id },
          },
        });
    }
  }
  await prisma.coupon.upsert({
    create: {
      code: 'LAUNCH20',
      name: 'Launch 20%',
      percentOff: 20,
      type: CouponType.PERCENT,
    },
    update: {},
    where: { code: 'LAUNCH20' },
  });
  const fixed = await prisma.coupon.upsert({
    create: {
      code: 'KODEYEIDR50',
      name: 'Kodeye IDR 50K',
      type: CouponType.FIXED_AMOUNT,
    },
    update: {},
    where: { code: 'KODEYEIDR50' },
  });
  await prisma.couponAmount.upsert({
    create: { amountOff: 50000, couponId: fixed.id, currencyCode: 'IDR' },
    update: { amountOff: 50000 },
    where: {
      couponId_currencyCode: { couponId: fixed.id, currencyCode: 'IDR' },
    },
  });
  for (const definition of SETTING_DEFINITIONS) {
    await prisma.appSetting.upsert({
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
  const isProduction = process.env.NODE_ENV === 'production';
  const adminEmail =
    process.env.ADMIN_SEED_EMAIL || (!isProduction ? 'admin@kodeye.local' : '');
  const adminPassword =
    process.env.ADMIN_SEED_PASSWORD || (!isProduction ? 'KodeyeAdmin123!' : '');
  if (adminEmail && adminPassword) {
    const email = adminEmail.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          name: process.env.ADMIN_SEED_NAME ?? 'Kodeye Admin',
          passwordHash: await bcrypt.hash(adminPassword, 12),
          role: UserRole.ADMIN,
        },
      });
      console.log(`Seeded admin user: ${email}`);
    } else if (process.env.ADMIN_SEED_OVERWRITE === 'true') {
      await prisma.user.update({
        data: {
          name: process.env.ADMIN_SEED_NAME ?? existing.name,
          passwordHash: await bcrypt.hash(adminPassword, 12),
          role: UserRole.ADMIN,
        },
        where: { id: existing.id },
      });
      console.log(`Updated existing admin user: ${email}`);
    } else if (existing.role !== UserRole.ADMIN) {
      await prisma.user.update({
        data: { role: UserRole.ADMIN },
        where: { id: existing.id },
      });
      console.log(`Promoted existing user to admin: ${email}`);
    } else {
      console.log(`Admin user already exists: ${email}`);
    }
  } else {
    console.log(
      'Admin seed skipped. ADMIN_SEED_EMAIL or ADMIN_SEED_PASSWORD not set.',
    );
  }
}

void main().finally(() => prisma.$disconnect());
