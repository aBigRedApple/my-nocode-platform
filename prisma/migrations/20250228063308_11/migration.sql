/*
  Warnings:

  - You are about to drop the column `avatar` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Box_layoutId_fkey` ON `box`;

-- DropIndex
DROP INDEX `Component_boxId_fkey` ON `component`;

-- DropIndex
DROP INDEX `Layout_userId_fkey` ON `layout`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `avatar`;

-- AddForeignKey
ALTER TABLE `Layout` ADD CONSTRAINT `Layout_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Box` ADD CONSTRAINT `Box_layoutId_fkey` FOREIGN KEY (`layoutId`) REFERENCES `Layout`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Component` ADD CONSTRAINT `Component_boxId_fkey` FOREIGN KEY (`boxId`) REFERENCES `Box`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
