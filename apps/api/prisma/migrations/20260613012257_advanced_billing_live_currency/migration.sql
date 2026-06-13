-- CreateTable
CREATE TABLE `currencies` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(3) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `symbol` VARCHAR(10) NOT NULL,
    `minor_unit` INTEGER NOT NULL DEFAULT 2,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `supported_by_midtrans` BOOLEAN NOT NULL DEFAULT false,
    `supported_by_paypal` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `currencies_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exchange_rates` (
    `id` VARCHAR(191) NOT NULL,
    `base_currency_code` VARCHAR(3) NOT NULL,
    `quote_currency_code` VARCHAR(3) NOT NULL,
    `rate` DECIMAL(18, 8) NOT NULL,
    `source` VARCHAR(100) NOT NULL,
    `effective_at` DATETIME(3) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `exchange_rates_base_currency_code_quote_currency_code_expire_idx`(`base_currency_code`, `quote_currency_code`, `expires_at`),
    UNIQUE INDEX `exchange_rates_base_currency_code_quote_currency_code_source_key`(`base_currency_code`, `quote_currency_code`, `source`, `effective_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plans` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `base_price_idr` INTEGER NULL,
    `interval` ENUM('MONTHLY', 'YEARLY', 'CUSTOM') NOT NULL,
    `max_repositories` INTEGER NOT NULL,
    `max_scans_per_month` INTEGER NOT NULL,
    `enable_pdf_report` BOOLEAN NOT NULL,
    `enable_github_auto_scan` BOOLEAN NOT NULL,
    `enable_recurring` BOOLEAN NOT NULL,
    `requires_manual_approval` BOOLEAN NOT NULL DEFAULT false,
    `is_enterprise` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `provider_metadata_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `plans_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_prices` (
    `id` VARCHAR(191) NOT NULL,
    `plan_id` VARCHAR(191) NOT NULL,
    `currency_code` VARCHAR(3) NOT NULL,
    `amount` INTEGER NOT NULL,
    `is_override` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `plan_prices_plan_id_currency_code_key`(`plan_id`, `currency_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `plan_id` VARCHAR(191) NOT NULL,
    `currency_code` VARCHAR(3) NOT NULL,
    `status` ENUM('FREE', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'SUSPENDED', 'INCOMPLETE') NOT NULL,
    `billing_mode` ENUM('ONE_TIME', 'RECURRING', 'MANUAL') NOT NULL DEFAULT 'ONE_TIME',
    `current_period_start` DATETIME(3) NULL,
    `current_period_end` DATETIME(3) NULL,
    `cancel_at_period_end` BOOLEAN NOT NULL DEFAULT false,
    `external_subscription_id` VARCHAR(255) NULL,
    `recurring_provider` ENUM('MIDTRANS', 'PAYPAL') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscriptions_organization_id_key`(`organization_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `plan_id` VARCHAR(191) NOT NULL,
    `plan_price_id` VARCHAR(191) NULL,
    `coupon_id` VARCHAR(191) NULL,
    `provider` ENUM('MIDTRANS', 'PAYPAL', 'MANUAL') NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `billing_mode` ENUM('ONE_TIME', 'RECURRING', 'MANUAL') NOT NULL,
    `amount` INTEGER NOT NULL,
    `subtotal_amount` INTEGER NOT NULL,
    `discount_amount` INTEGER NOT NULL,
    `taxable_amount` INTEGER NOT NULL,
    `tax_amount` INTEGER NOT NULL,
    `total_amount` INTEGER NOT NULL,
    `currency_code` VARCHAR(3) NOT NULL,
    `tax_rate` DECIMAL(5, 4) NOT NULL,
    `tax_label` VARCHAR(50) NULL,
    `exchange_rate_snapshot` JSON NULL,
    `external_order_id` VARCHAR(255) NULL,
    `external_transaction_id` VARCHAR(255) NULL,
    `external_subscription_id` VARCHAR(255) NULL,
    `checkout_url` VARCHAR(2048) NULL,
    `snap_token` VARCHAR(2048) NULL,
    `paid_at` DATETIME(3) NULL,
    `expired_at` DATETIME(3) NULL,
    `raw_response_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_external_order_id_key`(`external_order_id`),
    INDEX `payments_organization_id_created_at_idx`(`organization_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupons` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('PERCENT', 'FIXED_AMOUNT') NOT NULL,
    `percent_off` DECIMAL(5, 2) NULL,
    `max_redemptions` INTEGER NULL,
    `redeemed_count` INTEGER NOT NULL DEFAULT 0,
    `valid_from` DATETIME(3) NULL,
    `valid_until` DATETIME(3) NULL,
    `applies_to_plan_code` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `coupons_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupon_amounts` (
    `id` VARCHAR(191) NOT NULL,
    `coupon_id` VARCHAR(191) NOT NULL,
    `currency_code` VARCHAR(3) NOT NULL,
    `amount_off` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `coupon_amounts_coupon_id_currency_code_key`(`coupon_id`, `currency_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupon_usages` (
    `id` VARCHAR(191) NOT NULL,
    `coupon_id` VARCHAR(191) NOT NULL,
    `payment_id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `redeemed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `discount_amount` INTEGER NOT NULL,
    `currency_code` VARCHAR(3) NOT NULL,

    UNIQUE INDEX `coupon_usages_payment_id_key`(`payment_id`),
    INDEX `coupon_usages_coupon_id_organization_id_idx`(`coupon_id`, `organization_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` VARCHAR(191) NOT NULL,
    `invoice_number` VARCHAR(100) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `payment_id` VARCHAR(191) NULL,
    `subscription_id` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'ISSUED', 'PAID', 'VOID', 'REFUNDED') NOT NULL,
    `currency_code` VARCHAR(3) NOT NULL,
    `subtotal_amount` INTEGER NOT NULL,
    `discount_amount` INTEGER NOT NULL,
    `taxable_amount` INTEGER NOT NULL,
    `tax_amount` INTEGER NOT NULL,
    `total_amount` INTEGER NOT NULL,
    `tax_rate` DECIMAL(5, 4) NOT NULL,
    `tax_label` VARCHAR(50) NULL,
    `exchange_rate_snapshot` JSON NULL,
    `issued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `due_at` DATETIME(3) NULL,
    `paid_at` DATETIME(3) NULL,
    `pdf_path` VARCHAR(2048) NULL,
    `html_path` VARCHAR(2048) NULL,
    `metadata_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoice_number_key`(`invoice_number`),
    UNIQUE INDEX `invoices_payment_id_key`(`payment_id`),
    INDEX `invoices_organization_id_issued_at_idx`(`organization_id`, `issued_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_line_items` (
    `id` VARCHAR(191) NOT NULL,
    `invoice_id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit_amount` INTEGER NOT NULL,
    `total_amount` INTEGER NOT NULL,
    `currency_code` VARCHAR(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recurring_subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `subscription_id` VARCHAR(191) NOT NULL,
    `provider` ENUM('MIDTRANS', 'PAYPAL') NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'CANCELED', 'SUSPENDED', 'EXPIRED', 'FAILED') NOT NULL,
    `currency_code` VARCHAR(3) NOT NULL,
    `external_subscription_id` VARCHAR(255) NOT NULL,
    `external_customer_id` VARCHAR(255) NULL,
    `external_plan_id` VARCHAR(255) NULL,
    `external_product_id` VARCHAR(255) NULL,
    `started_at` DATETIME(3) NULL,
    `next_billing_at` DATETIME(3) NULL,
    `canceled_at` DATETIME(3) NULL,
    `raw_response_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `recurring_subscriptions_external_subscription_id_key`(`external_subscription_id`),
    INDEX `recurring_subscriptions_organization_id_idx`(`organization_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_webhook_events` (
    `id` VARCHAR(191) NOT NULL,
    `provider` ENUM('MIDTRANS', 'PAYPAL', 'MANUAL') NOT NULL,
    `event_id` VARCHAR(255) NULL,
    `external_order_id` VARCHAR(255) NULL,
    `external_subscription_id` VARCHAR(255) NULL,
    `event_type` VARCHAR(255) NULL,
    `status` VARCHAR(50) NOT NULL,
    `payload_json` JSON NULL,
    `error_message` TEXT NULL,
    `received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processed_at` DATETIME(3) NULL,

    UNIQUE INDEX `payment_webhook_events_provider_event_id_key`(`provider`, `event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enterprise_plan_requests` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `requester_user_id` VARCHAR(191) NOT NULL,
    `company_name` VARCHAR(255) NOT NULL,
    `contact_email` VARCHAR(255) NOT NULL,
    `preferred_currency_code` VARCHAR(3) NULL,
    `message` TEXT NULL,
    `requested_repositories` INTEGER NULL,
    `requested_scans_per_month` INTEGER NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CONTACTED') NOT NULL DEFAULT 'PENDING',
    `admin_note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `enterprise_plan_requests_organization_id_status_idx`(`organization_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `plan_prices` ADD CONSTRAINT `plan_prices_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plan_prices` ADD CONSTRAINT `plan_prices_currency_code_fkey` FOREIGN KEY (`currency_code`) REFERENCES `currencies`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_plan_price_id_fkey` FOREIGN KEY (`plan_price_id`) REFERENCES `plan_prices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_coupon_id_fkey` FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupon_amounts` ADD CONSTRAINT `coupon_amounts_coupon_id_fkey` FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupon_amounts` ADD CONSTRAINT `coupon_amounts_currency_code_fkey` FOREIGN KEY (`currency_code`) REFERENCES `currencies`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupon_usages` ADD CONSTRAINT `coupon_usages_coupon_id_fkey` FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupon_usages` ADD CONSTRAINT `coupon_usages_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_subscription_id_fkey` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_line_items` ADD CONSTRAINT `invoice_line_items_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_subscriptions` ADD CONSTRAINT `recurring_subscriptions_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_subscriptions` ADD CONSTRAINT `recurring_subscriptions_subscription_id_fkey` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enterprise_plan_requests` ADD CONSTRAINT `enterprise_plan_requests_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enterprise_plan_requests` ADD CONSTRAINT `enterprise_plan_requests_requester_user_id_fkey` FOREIGN KEY (`requester_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
