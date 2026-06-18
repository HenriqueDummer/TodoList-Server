-- DropIndex
DROP INDEX `Category_userId_fkey` ON `category`;

-- DropIndex
DROP INDEX `Task_categoryId_fkey` ON `task`;

-- DropIndex
DROP INDEX `Task_userId_fkey` ON `task`;

-- AlterTable
ALTER TABLE `category` ADD COLUMN `color` VARCHAR(191) NOT NULL DEFAULT '#0ea5e9',
    ADD COLUMN `icon` VARCHAR(191) NOT NULL DEFAULT 'list';

-- AlterTable
ALTER TABLE `task` ADD COLUMN `dueDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium';

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
