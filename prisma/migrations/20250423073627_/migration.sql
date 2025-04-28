-- AlterTable
ALTER TABLE `message` ADD COLUMN `replyToMessageId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_replyToMessageId_fkey` FOREIGN KEY (`replyToMessageId`) REFERENCES `message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
