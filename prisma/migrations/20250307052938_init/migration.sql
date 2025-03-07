/*
  Warnings:

  - Added the required column `name` to the `Layout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `component` ADD COLUMN `props` JSON NULL;

-- AlterTable
ALTER TABLE `layout` ADD COLUMN `description` VARCHAR(255) NULL,
    ADD COLUMN `name` VARCHAR(100) NOT NULL;

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
ALTER TABLE `Template` ADD CONSTRAINT `Template_layoutId_fkey` FOREIGN KEY (`layoutId`) REFERENCES `Layout`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
