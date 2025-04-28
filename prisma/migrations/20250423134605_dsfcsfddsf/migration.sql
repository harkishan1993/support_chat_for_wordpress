-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `message_replyToMessageId_fkey`;

-- DropIndex
DROP INDEX `message_replyToMessageId_fkey` ON `message`;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_replyToMessageId_fkey` FOREIGN KEY (`replyToMessageId`) REFERENCES `message`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
