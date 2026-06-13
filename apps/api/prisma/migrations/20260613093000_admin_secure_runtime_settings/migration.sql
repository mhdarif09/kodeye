CREATE TABLE `app_settings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(255) NOT NULL,
    `category` ENUM('APP', 'GITHUB', 'MIDTRANS', 'PAYPAL', 'BILLING', 'CURRENCY', 'SCANNER', 'REPORT', 'INVOICE', 'SECURITY') NOT NULL,
    `value_type` ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'SECRET') NOT NULL,
    `value` TEXT NULL,
    `encrypted_value` TEXT NULL,
    `encryption_iv` VARCHAR(255) NULL,
    `encryption_tag` VARCHAR(255) NULL,
    `key_version` VARCHAR(50) NULL,
    `is_secret` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by_user_id` VARCHAR(191) NULL,

    UNIQUE INDEX `app_settings_key_key`(`key`),
    INDEX `app_settings_category_idx`(`category`),
    INDEX `app_settings_updated_by_user_id_idx`(`updated_by_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `admin_audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actor_user_id` VARCHAR(191) NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'CLEAR_SECRET', 'TEST_CONNECTION', 'LOGIN_AS_ADMIN', 'SETTINGS_RELOAD') NOT NULL,
    `resource_type` VARCHAR(100) NOT NULL,
    `resource_id` VARCHAR(255) NULL,
    `resource_key` VARCHAR(255) NULL,
    `ip_address` VARCHAR(100) NULL,
    `user_agent` TEXT NULL,
    `metadata_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `admin_audit_logs_actor_user_id_idx`(`actor_user_id`),
    INDEX `admin_audit_logs_action_idx`(`action`),
    INDEX `admin_audit_logs_resource_type_idx`(`resource_type`),
    INDEX `admin_audit_logs_resource_key_idx`(`resource_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `app_settings` ADD CONSTRAINT `app_settings_updated_by_user_id_fkey` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `admin_audit_logs` ADD CONSTRAINT `admin_audit_logs_actor_user_id_fkey` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
