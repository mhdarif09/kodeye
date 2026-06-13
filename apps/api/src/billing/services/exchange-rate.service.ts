import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AppSettingsService } from '../../settings/app-settings.service';

@Injectable()
export class ExchangeRateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppSettingsService,
  ) {}

  async getRate(base: string, quote: string) {
    if (base === quote)
      return {
        effectiveAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
        isStale: false,
        rate: new Prisma.Decimal(1),
        source: 'identity',
      };
    const cached = await this.prisma.exchangeRate.findFirst({
      orderBy: { effectiveAt: 'desc' },
      where: { baseCurrencyCode: base, quoteCurrencyCode: quote },
    });
    if (cached && cached.expiresAt > new Date())
      return { ...cached, isStale: false };
    try {
      return await this.refreshRate(base, quote);
    } catch {
      if (
        cached &&
        this.config.get('BILLING_ALLOW_STALE_EXCHANGE_RATE', 'true') === 'true'
      )
        return { ...cached, isStale: true };
      throw new ServiceUnavailableException(
        'Currency conversion is temporarily unavailable. Please try IDR or try again later.',
      );
    }
  }

  async refreshRate(base: string, quote: string) {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}&to=${encodeURIComponent(quote)}`,
    );
    if (!response.ok) throw new Error('FX provider unavailable');
    const payload = (await response.json()) as {
      date: string;
      rates: Record<string, number>;
    };
    const value = payload.rates[quote];
    if (!value) throw new BadRequestException('Currency pair is unavailable');
    const ttl = Number(
      this.config.get('BILLING_EXCHANGE_RATE_CACHE_TTL_HOURS', '24'),
    );
    const effectiveAt = new Date();
    const expiresAt = new Date(effectiveAt.getTime() + ttl * 3600000);
    const saved = await this.prisma.exchangeRate.create({
      data: {
        baseCurrencyCode: base,
        effectiveAt,
        expiresAt,
        quoteCurrencyCode: quote,
        rate: new Prisma.Decimal(value.toString()),
        source: 'frankfurter',
      },
    });
    return { ...saved, isStale: false };
  }

  async convertMinorAmount(amount: number, from: string, to: string) {
    const [fromCurrency, toCurrency, rate] = await Promise.all([
      this.prisma.currency.findUnique({ where: { code: from } }),
      this.prisma.currency.findUnique({ where: { code: to } }),
      this.getRate(from, to),
    ]);
    if (!fromCurrency || !toCurrency)
      throw new BadRequestException('Unsupported currency');
    const major = new Prisma.Decimal(amount).div(
      new Prisma.Decimal(10).pow(fromCurrency.minorUnit),
    );
    const converted = major
      .mul(rate.rate)
      .mul(new Prisma.Decimal(10).pow(toCurrency.minorUnit))
      .toDecimalPlaces(0);
    return {
      amount: Number(converted.toString()),
      snapshot: {
        effectiveAt: rate.effectiveAt.toISOString(),
        expiresAt: rate.expiresAt.toISOString(),
        from,
        isStale: rate.isStale,
        rate: rate.rate.toString(),
        source: rate.source,
        to,
      },
    };
  }
}
