/*
  Warnings:

  - You are about to alter the column `positionX` on the `box` table. The data in that column could be lost. The data in that column will be cast from `Int` to `SmallInt`.
  - You are about to alter the column `positionY` on the `box` table. The data in that column could be lost. The data in that column will be cast from `Int` to `SmallInt`.
  - You are about to alter the column `type` on the `component` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `name` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - Added the required column `updatedAt` to the `Box` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Component` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Layout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `box` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `positionX` SMALLINT NOT NULL,
    MODIFY `positionY` SMALLINT NOT NULL;

-- AlterTable
ALTER TABLE `component` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `type` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `layout` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `template` ADD COLUMN `category` VARCHAR(50) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` VARCHAR(255) NULL,
    ADD COLUMN `name` VARCHAR(100) NOT NULL,
    ADD COLUMN `thumbnail` VARCHAR(255) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `userId` INTEGER NULL,
    MODIFY `layoutId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `name` VARCHAR(100) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX `Template_category_idx` ON `Template`(`category`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `Layout` ADD CONSTRAINT `Layout_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Box` ADD CONSTRAINT `Box_layoutId_fkey` FOREIGN KEY (`layoutId`) REFERENCES `Layout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Component` ADD CONSTRAINT `Component_boxId_fkey` FOREIGN KEY (`boxId`) REFERENCES `Box`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Template` ADD CONSTRAINT `Template_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Template` ADD CONSTRAINT `Template_layoutId_fkey` FOREIGN KEY (`layoutId`) REFERENCES `Layout`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `box` RENAME INDEX `Box_layoutId_fkey` TO `Box_layoutId_idx`;

-- RenameIndex
ALTER TABLE `component` RENAME INDEX `Component_boxId_fkey` TO `Component_boxId_idx`;

-- RenameIndex
ALTER TABLE `layout` RENAME INDEX `Layout_userId_fkey` TO `Layout_userId_idx`;

-- RenameIndex
ALTER TABLE `template` RENAME INDEX `Template_layoutId_fkey` TO `Template_layoutId_idx`;

-- RenameIndex
ALTER TABLE `template` RENAME INDEX `Template_userId_fkey` TO `Template_userId_idx`;
