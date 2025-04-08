/*
  Warnings:

  - The values [assistance,admin] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('user', 'administrator', 'support_manager') NOT NULL DEFAULT 'user';
