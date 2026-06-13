# Billing dan Currency

Billing config mengatur tax, default currency, supported currencies, live currency conversion, dan cache exchange rate.

Settings:

- `BILLING_TAX_ENABLED`
- `BILLING_DEFAULT_TAX_RATE`
- `BILLING_TAX_LABEL`
- `BILLING_DEFAULT_CURRENCY`
- `BILLING_SUPPORTED_CURRENCIES`
- `BILLING_USE_LIVE_CURRENCY`
- `BILLING_EXCHANGE_RATE_PROVIDER`
- `BILLING_EXCHANGE_RATE_CACHE_TTL_HOURS`
- `BILLING_ALLOW_STALE_EXCHANGE_RATE`

Rules:

- Amount disimpan sebagai integer minor unit.
- IDR minor unit 0.
- USD/EUR/SGD minor unit 2.
- Checkout amount dikunci setelah payment dibuat.
- Invoice memakai payment snapshot.

Test:

1. Klik Test Currency.
2. Buka pricing page.
3. Switch currency.
4. Cek tax breakdown.

Common errors:

- Exchange provider unavailable.
- Stale exchange rate.
- Unsupported currency.
- Tax rate bukan decimal 0 sampai 1.
