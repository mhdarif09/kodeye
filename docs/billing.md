# Phase 9 Billing

Kodeye billing stores every monetary amount as an integer minor unit. IDR uses
zero decimal places; USD, EUR, and SGD use two. Tax rates and exchange rates are
the only Decimal values. Pending payment amounts and their exchange-rate
snapshots are immutable.

## Pricing and Currency

Plans use IDR base prices. Active `PlanPrice` records override conversion.
Otherwise the API requests Frankfurter rates and caches them in
`exchange_rates` for the configured TTL. A cached stale rate is used only when
`BILLING_ALLOW_STALE_EXCHANGE_RATE=true`. Checkout is blocked with a clear
message when no acceptable conversion is available.

Midtrans checkout is IDR-only. PayPal checkout supports USD, EUR, and SGD.
Kodeye never silently changes the selected provider currency.

## Payments and Subscriptions

Provider credentials remain server-side. One-time payments are created as
PENDING and activate subscriptions only after a verified Midtrans notification
or a backend PayPal capture. PayPal recurring creates provider product, plan,
and subscription records, then activates locally only after backend
verification. Midtrans recurring fails clearly when the configured sandbox
channel does not support it.

Payment webhooks and coupon usage are idempotent. A coupon is redeemed only
when payment becomes PAID. Percent coupons support every currency; fixed
coupons require a matching `CouponAmount`.

## Tax and Invoices

The breakdown is subtotal minus discount, then configurable tax, then total.
Paid payments create a matching invoice and line item. Invoice PDF is generated
on demand using the same local Puppeteer setup as security reports.

Tax calculation is configurable and should be reviewed by finance/legal before
production.

## Limits and Enterprise

The current plan limits repository count, monthly scans, automatic GitHub
scans, and PDF security reports. Organizations without a subscription use Free
plan limits. Enterprise requests are stored for admin review and custom manual
assignment.

## Seed and Admin

Run `pnpm --filter api exec prisma db seed`. The idempotent seed creates IDR,
USD, EUR, SGD, four plans, free price overrides, and sample coupons. An ADMIN
In production, an admin user is created only when `ADMIN_SEED_EMAIL` and
`ADMIN_SEED_PASSWORD` are set. In local development, the seed creates
`admin@kodeye.local` with password `KodeyeAdmin123!` when no admin seed
credentials are configured. Change or replace this account before exposing the
application.

## Admin control center

Open `/dashboard/admin/billing` as an ADMIN user to manage plan limits, feature
flags, fixed currency price overrides, and backend provider credentials.
Dashboard-managed credentials are encrypted at rest with AES-256-GCM and masked
when returned by the API. Values saved in the dashboard override environment
values and apply without restarting the API.
GitHub App ID/private key and check settings are also loaded by the scanner
worker from the encrypted settings table when the worker starts.

`DATABASE_URL`, `JWT_SECRET`, and `SETTINGS_ENCRYPTION_KEY` deliberately
remain environment-only because the API needs them before the database-backed
admin dashboard is available.
the password is hashed and never printed.

## Local Provider Testing

Use sandbox credentials and expose the API with `ngrok http 3001`. Point
Midtrans notifications and PayPal webhooks to the public API URLs. Never use
production provider secrets locally or commit them.

Known limitations: no advanced accounting ledger, automated complex refunds,
multi-country tax compliance, Kubernetes, or production deployment automation.
