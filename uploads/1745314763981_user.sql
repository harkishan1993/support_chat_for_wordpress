-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 17, 2025 at 12:31 PM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `supportchat`
--

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fullName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('male','female') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profilePic` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `role` enum('user','administrator','support_manager') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `assistanceId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `fullName`, `password`, `gender`, `profilePic`, `createdAt`, `updatedAt`, `role`, `assistanceId`) VALUES
('1', 'admin', NULL, NULL, NULL, NULL, '2025-04-04 09:01:09.384', '2025-04-04 09:01:09.384', 'administrator', NULL),
('2', 'support manager 1', 'support manager 1', NULL, NULL, NULL, '2025-04-04 08:29:31.422', '2025-04-14 13:00:02.785', 'support_manager', NULL),
('3', 'Support Manager 2', 'Support Manager 2', NULL, NULL, NULL, '2025-04-04 10:21:32.357', '2025-04-14 05:36:48.458', 'support_manager', NULL),
('4', 'user 1', 'user 1', NULL, NULL, NULL, '2025-04-04 08:29:12.227', '2025-04-14 13:00:03.188', 'user', '2'),
('5', 'user 2', 'user 2', NULL, NULL, NULL, '2025-04-04 10:10:31.818', '2025-04-14 05:36:48.476', 'user', '3'),
('6', 'user3', NULL, NULL, NULL, NULL, '2025-04-07 08:02:42.588', '2025-04-07 08:03:14.972', 'user', '3'),
('cm8wpc4hv0001dnnkhgmea0he', 'bot', 'Bot', NULL, NULL, NULL, '2025-04-07 17:33:01.000', '2025-04-07 17:33:01.000', 'user', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
