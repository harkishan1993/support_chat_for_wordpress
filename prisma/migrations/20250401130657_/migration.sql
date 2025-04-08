-- DropIndex
DROP INDEX `User_username_key` ON `user`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('user', 'assistance', 'admin') NOT NULL DEFAULT 'user',
    MODIFY `username` VARCHAR(191) NULL,
    MODIFY `fullName` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL,
    MODIFY `gender` ENUM('male', 'female') NULL,
    MODIFY `profilePic` VARCHAR(191) NULL;
