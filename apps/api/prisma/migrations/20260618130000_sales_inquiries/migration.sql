CREATE TABLE `sales_inquiries` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `company_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(100) NULL,
    `service` VARCHAR(120) NOT NULL,
    `budget` VARCHAR(120) NULL,
    `timeline` VARCHAR(120) NULL,
    `message` TEXT NOT NULL,
    `source` VARCHAR(120) NOT NULL DEFAULT 'contact-sales',
    `status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST') NOT NULL DEFAULT 'NEW',
    `admin_note` TEXT NULL,
    `contacted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `sales_inquiries_status_created_at_idx`(`status`, `created_at`),
    INDEX `sales_inquiries_service_idx`(`service`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
