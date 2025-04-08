-- AlterTable
ALTER TABLE `message` ADD COLUMN `type` ENUM('text', 'emoji', 'reply') NOT NULL DEFAULT 'text';
