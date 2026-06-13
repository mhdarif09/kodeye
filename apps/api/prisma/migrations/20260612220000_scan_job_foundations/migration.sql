-- CreateTable
CREATE TABLE `scan_jobs` (
    `id` VARCHAR(191) NOT NULL,
    `repository_id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `triggered_by_user_id` VARCHAR(191) NULL,
    `trigger_type` ENUM('MANUAL', 'GITHUB_PUSH', 'GITHUB_PULL_REQUEST') NOT NULL DEFAULT 'MANUAL',
    `branch` VARCHAR(255) NULL,
    `commit_sha` VARCHAR(255) NULL,
    `pull_request_number` INTEGER NULL,
    `status` ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `error_message` TEXT NULL,
    `started_at` DATETIME(3) NULL,
    `finished_at` DATETIME(3) NULL,
    `total_findings` INTEGER NOT NULL DEFAULT 0,
    `critical_count` INTEGER NOT NULL DEFAULT 0,
    `high_count` INTEGER NOT NULL DEFAULT 0,
    `medium_count` INTEGER NOT NULL DEFAULT 0,
    `low_count` INTEGER NOT NULL DEFAULT 0,
    `info_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `scan_jobs_repository_id_idx`(`repository_id`),
    INDEX `scan_jobs_organization_id_idx`(`organization_id`),
    INDEX `scan_jobs_status_idx`(`status`),
    INDEX `scan_jobs_triggered_by_user_id_idx`(`triggered_by_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `findings` (
    `id` VARCHAR(191) NOT NULL,
    `scan_job_id` VARCHAR(191) NOT NULL,
    `scanner` VARCHAR(100) NOT NULL,
    `category` VARCHAR(255) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `description` TEXT NULL,
    `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `confidence` ENUM('HIGH', 'MEDIUM', 'LOW', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `file_path` VARCHAR(2048) NULL,
    `line_start` INTEGER NULL,
    `line_end` INTEGER NULL,
    `evidence_masked` TEXT NULL,
    `cwe` VARCHAR(100) NULL,
    `owasp` VARCHAR(255) NULL,
    `impact` TEXT NULL,
    `recommendation` TEXT NULL,
    `status` ENUM('OPEN', 'IGNORED', 'FIXED', 'FALSE_POSITIVE') NOT NULL DEFAULT 'OPEN',
    `raw_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `findings_scan_job_id_idx`(`scan_job_id`),
    INDEX `findings_severity_idx`(`severity`),
    INDEX `findings_scanner_idx`(`scanner`),
    INDEX `findings_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scan_logs` (
    `id` VARCHAR(191) NOT NULL,
    `scan_job_id` VARCHAR(191) NOT NULL,
    `level` VARCHAR(50) NOT NULL,
    `message` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `scan_logs_scan_job_id_idx`(`scan_job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `scan_jobs` ADD CONSTRAINT `scan_jobs_repository_id_fkey` FOREIGN KEY (`repository_id`) REFERENCES `repositories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scan_jobs` ADD CONSTRAINT `scan_jobs_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scan_jobs` ADD CONSTRAINT `scan_jobs_triggered_by_user_id_fkey` FOREIGN KEY (`triggered_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `findings` ADD CONSTRAINT `findings_scan_job_id_fkey` FOREIGN KEY (`scan_job_id`) REFERENCES `scan_jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scan_logs` ADD CONSTRAINT `scan_logs_scan_job_id_fkey` FOREIGN KEY (`scan_job_id`) REFERENCES `scan_jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
