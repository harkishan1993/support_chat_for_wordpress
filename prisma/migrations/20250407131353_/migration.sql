-- AlterTable
ALTER TABLE `message` MODIFY `type` ENUM('text', 'emoji', 'reply', 'welcome') NOT NULL DEFAULT 'text';
