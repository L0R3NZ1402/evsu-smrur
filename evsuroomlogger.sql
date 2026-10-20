-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 20, 2026 at 05:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `evsuroomlogger`
--

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `id` int(11) NOT NULL,
  `room` int(11) NOT NULL,
  `u_start` timestamp NULL DEFAULT NULL,
  `u_end` timestamp NULL DEFAULT NULL,
  `user` int(11) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logs`
--

INSERT INTO `logs` (`id`, `room`, `u_start`, `u_end`, `user`, `timestamp`) VALUES
(1, 3, '2026-10-20 09:59:50', '2026-10-20 11:38:43', 5, '2026-10-20 11:38:43'),
(2, 1, '2026-10-20 11:40:17', '2026-10-20 11:41:46', 5, '2026-10-20 11:41:46'),
(3, 1, '2026-10-20 11:42:08', '2026-10-20 11:42:24', 11, '2026-10-20 11:42:24'),
(4, 1, '2026-10-20 13:33:16', '2026-10-20 13:44:04', 5, '2026-10-20 13:44:04');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `qr_id` varchar(255) NOT NULL,
  `room` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `status` varchar(25) NOT NULL,
  `user` int(11) DEFAULT NULL,
  `usage_stamp` timestamp NULL DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `qr_id`, `room`, `location`, `status`, `user`, `usage_stamp`, `timestamp`) VALUES
(1, 'GS_SMR1', 'Graduate School Smart Room 1', 'Graduate School', 'Vacant', NULL, NULL, '2026-10-20 05:22:49'),
(2, 'GS_SMR2', 'Graduate School Smart Room 2', 'Graduate School', 'Vacant', NULL, NULL, '2026-10-20 05:22:49'),
(3, 'IT_SMR1', 'IT Smart Room 1', 'IT Building', 'Vacant', NULL, NULL, '2026-10-20 05:22:49'),
(4, 'IT_SMR2', 'IT Smart Room 2', 'IT Building', 'Vacant', NULL, NULL, '2026-10-20 05:22:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fname` varchar(255) NOT NULL,
  `lname` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  `status` varchar(25) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fname`, `lname`, `username`, `password`, `department`, `status`, `timestamp`) VALUES
(5, 'Lorenz Gabriel', 'Sabalza', 'Lorenz1402', '12345', 'Information Technology Department', 'Active', '2026-10-20 06:08:46'),
(11, 'Joshua Andrei', 'Saludo', 'ItsMeAndrei', '12345', 'Information Technology Department', 'Active', '2026-10-20 08:01:19'),
(12, 'John Philip', 'Pacho', 'SirJPTheGoat', '12345', 'Information Technology Department', 'Pending', '2026-10-20 08:09:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_logs_room` (`room`),
  ADD KEY `fk_logs_user` (`user`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_rooms_user` (`user`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `fk_logs_room` FOREIGN KEY (`room`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_logs_user` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `fk_rooms_user` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
