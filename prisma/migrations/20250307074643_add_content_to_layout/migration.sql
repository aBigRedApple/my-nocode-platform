/*
  Warnings:

  - You are about to drop the column `layoutId` on the `template` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,templateId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Template_layoutId_idx` ON `template`;

-- AlterTable
ALTER TABLE `layout` ADD COLUMN `content` JSON NULL;

-- AlterTable
ALTER TABLE `template` DROP COLUMN `layoutId`;

-- CreateTable
CREATE TABLE `LayoutTemplate` (
    `layoutId` INTEGER NOT NULL,
    `templateId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LayoutTemplate_layoutId_idx`(`layoutId`),
    INDEX `LayoutTemplate_templateId_idx`(`templateId`),
    PRIMARY KEY (`layoutId`, `templateId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Component_type_idx` ON `Component`(`type`);

-- Drop existing Favorite table if it exists
DROP TABLE IF EXISTS `Favorite`;

-- Create new Favorite table with SMALLINT columns
CREATE TABLE `Favorite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` SMALLINT NOT NULL,
    `templateId` SMALLINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `Favorite_userId_templateId_key` (`userId`, `templateId`),
    INDEX `Favorite_userId_idx` (`userId`),
    INDEX `Favorite_templateId_idx` (`templateId`),
    CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `Favorite_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `Template`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Image_path_idx` ON `Image`(`path`);

-- AddForeignKey
ALTER TABLE `Layout` ADD CONSTRAINT `Layout_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Box` ADD CONSTRAINT `Box_layoutId_fkey` FOREIGN KEY (`layoutId`) REFERENCES `Layout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Component` ADD CONSTRAINT `Component_boxId_fkey` FOREIGN KEY (`boxId`) REFERENCES `Box`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Component` ADD CONSTRAINT `Component_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Image`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Template` ADD CONSTRAINT `Template_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LayoutTemplate` ADD CONSTRAINT `LayoutTemplate_layoutId_fkey` FOREIGN KEY (`layoutId`) REFERENCES `Layout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LayoutTemplate` ADD CONSTRAINT `LayoutTemplate_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `Template`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `Template`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `favorite` RENAME INDEX `Favorite_templateId_fkey` TO `Favorite_templateId_idx`;

-- RenameIndex
ALTER TABLE `favorite` RENAME INDEX `Favorite_userId_fkey` TO `Favorite_userId_idx`;
