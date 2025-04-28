-- AlterTable
ALTER TABLE `message` MODIFY `type` ENUM('text', 'emoji', 'reply', 'welcome', 'file', 'voice') NOT NULL DEFAULT 'text';
