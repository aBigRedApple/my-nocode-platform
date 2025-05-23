/*
  Warnings:

  - You are about to drop the column `order` on the `box` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Box_order_idx` ON `box`;

-- AlterTable
ALTER TABLE `box` DROP COLUMN `order`,
    ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `layout` ADD COLUMN `preview` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Layout` ADD CONSTRAINT `Layout_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Box` ADD CONSTRAINT `Box_layoutId_fkey` FOREIGN KEY (`layoutId`) REFERENCES `Layout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Component` ADD CONSTRAINT `Component_boxId_fkey` FOREIGN KEY (`boxId`) REFERENCES `Box`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
