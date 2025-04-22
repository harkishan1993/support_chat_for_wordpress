-- AlterTable
ALTER TABLE `message` MODIFY `type` ENUM('text', 'emoji', 'reply', 'welcome', 'file') NOT NULL DEFAULT 'text';
