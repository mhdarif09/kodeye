ALTER TABLE `repositories`
  ADD COLUMN `auto_scan_push_enabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `auto_scan_pull_request_enabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `is_archived` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `is_connected` BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE `scan_jobs`
  ADD COLUMN `github_check_run_id` VARCHAR(255) NULL,
  ADD COLUMN `github_check_url` VARCHAR(2048) NULL,
  ADD COLUMN `webhook_delivery_id` VARCHAR(255) NULL;

CREATE INDEX `scan_jobs_commit_sha_idx` ON `scan_jobs`(`commit_sha`);
CREATE INDEX `scan_jobs_pull_request_number_idx` ON `scan_jobs`(`pull_request_number`);
CREATE INDEX `scan_jobs_github_check_run_id_idx` ON `scan_jobs`(`github_check_run_id`);
CREATE INDEX `scan_jobs_webhook_delivery_id_idx` ON `scan_jobs`(`webhook_delivery_id`);

CREATE TABLE `github_webhook_deliveries` (
  `id` VARCHAR(191) NOT NULL,
  `delivery_id` VARCHAR(255) NOT NULL,
  `event_name` VARCHAR(100) NOT NULL,
  `action` VARCHAR(100) NULL,
  `repository_full_name` VARCHAR(255) NULL,
  `status` VARCHAR(50) NOT NULL,
  `error_message` TEXT NULL,
  `received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `processed_at` DATETIME(3) NULL,
  UNIQUE INDEX `github_webhook_deliveries_delivery_id_key`(`delivery_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
