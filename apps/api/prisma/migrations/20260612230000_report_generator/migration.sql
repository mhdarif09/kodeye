-- CreateTable
CREATE TABLE `reports` (
    `id` VARCHAR(191) NOT NULL,
    `scan_job_id` VARCHAR(191) NOT NULL,
    `html_path` VARCHAR(2048) NULL,
    `pdf_path` VARCHAR(2048) NULL,
    `json_path` VARCHAR(2048) NULL,
    `generated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reports_scan_job_id_key`(`scan_job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_scan_job_id_fkey` FOREIGN KEY (`scan_job_id`) REFERENCES `scan_jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
