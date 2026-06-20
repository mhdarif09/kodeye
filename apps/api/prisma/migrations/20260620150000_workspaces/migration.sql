-- CreateTable
CREATE TABLE `workspaces` (
    `id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `created_by_user_id` VARCHAR(191) NULL,
    `name` VARCHAR(255) NOT NULL,
    `source` ENUM('LOCAL', 'GIT', 'UPLOAD') NOT NULL DEFAULT 'LOCAL',
    `root_path` VARCHAR(2048) NOT NULL,
    `repository_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `workspaces_organization_id_idx`(`organization_id`),
    INDEX `workspaces_created_by_user_id_idx`(`created_by_user_id`),
    INDEX `workspaces_repository_id_idx`(`repository_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `workspaces` ADD CONSTRAINT `workspaces_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workspaces` ADD CONSTRAINT `workspaces_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
