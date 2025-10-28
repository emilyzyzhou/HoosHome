-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 27, 2025 at 09:22 PM
-- Server version: 10.6.22-MariaDB-0ubuntu0.22.04.1
-- PHP Version: 8.1.2-1ubuntu2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `csz6wd`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`csz6wd`@`%` PROCEDURE `split_bill` (IN `p_bill_id` INT)   BEGIN
    DECLARE v_home_id INT;
    DECLARE v_total DECIMAL(10, 2);
    DECLARE v_member_count INT;

    SELECT home_id, total_amount INTO v_home_id, v_total
    FROM Bill 
    WHERE bill_id = p_bill_id;

    IF v_home_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bill not found';
    END IF;

    SELECT COUNT(*) INTO v_member_count
    FROM HomeMembership
    WHERE home_id = v_home_id
      AND (end_date IS NULL OR end_date >= CURDATE());

    IF v_member_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No active members to split the bill among';
    END IF;

    DELETE FROM BillShare WHERE bill_id = p_bill_id;

    SET @total_cents := ROUND(v_total * 100);
    SET @base_share_cents := FLOOR(@total_cents / v_member_count);
    SET @remainder_cents := @total_cents % v_member_count;
    SET @row_num := 0;

    INSERT INTO BillShare (bill_id, user_id, amount_due, status)
    SELECT 
        p_bill_id AS bill_id,
        user_id,
        (CASE
            WHEN (@row_num := @row_num + 1) <= @remainder_cents
                THEN (@base_share_cents + 1)
            ELSE @base_share_cents
        END) / 100.0 AS amount_due,
        'unpaid' AS status
    FROM (
        SELECT user_id
        FROM HomeMembership
        WHERE home_id = v_home_id
          AND (end_date IS NULL OR end_date >= CURDATE())
        ORDER BY user_id
    ) AS active_members;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Bill`
--

CREATE TABLE `Bill` (
  `bill_id` int(11) NOT NULL,
  `home_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `bill_type` varchar(255) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `payer_user_id` int(11) DEFAULT NULL,
  `split_rule` varchar(255) DEFAULT NULL
) ;

--
-- Dumping data for table `Bill`
--

INSERT INTO `Bill` (`bill_id`, `home_id`, `description`, `bill_type`, `total_amount`, `due_date`, `payer_user_id`, `split_rule`) VALUES
(1, 1, 'October Internet', 'Utility', '65.00', '2025-10-30', 1, 'Split Equally'),
(2, 1, 'October Electric', 'Utility', '112.50', '2025-11-05', 2, 'Split Equally'),
(3, 2, 'October Gas', 'Utility', '45.00', '2025-11-08', 4, 'Split Equally'),
(4, 2, 'Weekly Groceries', 'Groceries', '150.00', '2025-10-26', 5, 'Split Equally'),
(5, 1, 'November Rent', 'Rent', '2400.00', '2025-11-01', 1, 'Split Equally'),
(6, 2, 'Internet Bill', 'Utility', '75.00', '2025-11-01', 6, 'Split Equally'),
(7, 1, 'Pizza Night', 'Food', '42.00', '2025-10-25', 3, 'Split Equally');

-- --------------------------------------------------------

--
-- Table structure for table `BillShare`
--

CREATE TABLE `BillShare` (
  `bill_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount_due` decimal(10,2) NOT NULL,
  `status` varchar(255) NOT NULL
) ;

--
-- Dumping data for table `BillShare`
--

INSERT INTO `BillShare` (`bill_id`, `user_id`, `amount_due`, `status`) VALUES
(1, 1, '21.67', 'paid'),
(1, 2, '21.67', 'unpaid'),
(1, 3, '21.66', 'unpaid'),
(2, 1, '37.50', 'unpaid'),
(2, 2, '37.50', 'paid'),
(2, 3, '37.50', 'unpaid'),
(3, 4, '15.00', 'paid'),
(3, 5, '15.00', 'unpaid'),
(3, 6, '15.00', 'unpaid'),
(4, 4, '50.00', 'unpaid'),
(4, 5, '50.00', 'paid'),
(4, 6, '50.00', 'paid'),
(5, 1, '800.00', 'paid'),
(5, 2, '800.00', 'unpaid'),
(5, 3, '800.00', 'unpaid'),
(6, 4, '25.00', 'unpaid'),
(6, 5, '25.00', 'unpaid'),
(6, 6, '25.00', 'paid'),
(7, 1, '14.00', 'paid'),
(7, 2, '14.00', 'unpaid'),
(7, 3, '14.00', 'paid');

-- --------------------------------------------------------

--
-- Table structure for table `Chore`
--

CREATE TABLE `Chore` (
  `chore_id` int(11) NOT NULL,
  `home_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `due_date` date NOT NULL,
  `recurrence` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Chore`
--

INSERT INTO `Chore` (`chore_id`, `home_id`, `title`, `description`, `due_date`, `recurrence`) VALUES
(1, 1, 'Take out trash & recycling', 'All bins to the curb for Tuesday morning pickup.', '2025-10-28', 'Weekly'),
(2, 1, 'Clean kitchen', 'Wipe counters, sweep floor, and clean sink.', '2025-10-26', 'Weekly'),
(3, 1, 'Clean main bathroom', 'Clean toilet, shower, and sink.', '2025-10-27', 'Weekly'),
(4, 2, 'Vacuum common areas', 'Living room and hallway.', '2025-10-29', 'Weekly'),
(5, 2, 'Take out compost', 'Take kitchen compost bin to the outdoor pile.', '2025-10-30', 'Weekly'),
(6, 1, 'Water the plants', 'Living room and kitchen plants.', '2025-11-01', 'Bi-Weekly'),
(7, 2, 'Wipe down appliances', 'Microwave, toaster, and coffee maker.', '2025-10-28', 'Weekly');

-- --------------------------------------------------------

--
-- Table structure for table `ChoreAssignment`
--

CREATE TABLE `ChoreAssignment` (
  `chore_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` varchar(255) NOT NULL
) ;

--
-- Dumping data for table `ChoreAssignment`
--

INSERT INTO `ChoreAssignment` (`chore_id`, `user_id`, `status`) VALUES
(1, 3, 'done'),
(2, 1, 'in_progress'),
(3, 2, 'pending'),
(4, 5, 'done'),
(5, 6, 'pending'),
(7, 4, 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `EmergencyContact`
--

CREATE TABLE `EmergencyContact` (
  `contact_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) NOT NULL,
  `relation_to_user` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `EmergencyContact`
--

INSERT INTO `EmergencyContact` (`contact_id`, `user_id`, `name`, `email`, `phone_number`, `relation_to_user`) VALUES
(1, 1, 'David Chen', 'd.chen@example.com', '202-555-0155', 'Father'),
(2, 2, 'Maria Garcia', 'm.garcia@example.com', '305-555-0144', 'Mother'),
(3, 3, 'Sarah Davis', 'sarahd@example.com', '804-555-0188', 'Sister'),
(4, 4, 'Tom Smith', 'tom.s@example.com', '434-555-0121', 'Brother'),
(5, 6, 'Jin Kim', 'jin.kim@example.com', '571-555-0133', 'Cousin');

-- --------------------------------------------------------

--
-- Table structure for table `Event`
--

CREATE TABLE `Event` (
  `event_id` int(11) NOT NULL,
  `home_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_start` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `event_end` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `created_by_user_id` int(11) NOT NULL
) ;

--
-- Dumping data for table `Event`
--

INSERT INTO `Event` (`event_id`, `home_id`, `title`, `description`, `event_start`, `event_end`, `created_by_user_id`) VALUES
(1, 1, 'Project Milestone Celebration', 'We finished the database project! Let\'s order pizza.', '2025-10-25 23:00:00', '2025-10-26 02:00:00', 1),
(2, 2, 'House Meeting', 'Discuss chore schedule and upcoming bills.', '2025-10-26 22:00:00', '2025-10-26 22:30:00', 4),
(3, 1, 'Movie Night', 'Watching the new Dune movie in the living room.', '2025-11-01 00:00:00', '2025-11-01 03:00:00', 2),
(4, 2, 'Group Study Session', 'Midterm prep for CS 3140 in the dining room.', '2025-11-02 19:00:00', '2025-11-02 22:00:00', 6),
(5, 1, 'Game Night', 'Board games and snacks.', '2025-11-08 00:30:00', '2025-11-08 04:00:00', 3);

-- --------------------------------------------------------

--
-- Table structure for table `EventInvite`
--

CREATE TABLE `EventInvite` (
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rsvp_status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `EventInvite`
--

INSERT INTO `EventInvite` (`event_id`, `user_id`, `rsvp_status`) VALUES
(1, 1, 'attending'),
(1, 2, 'attending'),
(1, 3, 'maybe'),
(2, 4, 'attending'),
(2, 5, 'attending'),
(2, 6, 'attending'),
(3, 1, 'attending'),
(3, 2, 'attending'),
(3, 3, 'declined'),
(4, 4, 'pending'),
(4, 5, 'attending'),
(4, 6, 'attending'),
(5, 1, 'pending'),
(5, 2, 'pending'),
(5, 3, 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `HomeMembership`
--

CREATE TABLE `HomeMembership` (
  `user_id` int(11) NOT NULL,
  `home_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `HomeMembership`
--

INSERT INTO `HomeMembership` (`user_id`, `home_id`, `start_date`, `end_date`) VALUES
(1, 1, '2025-08-15', NULL),
(2, 1, '2025-08-15', NULL),
(3, 1, '2025-08-15', NULL),
(4, 2, '2025-08-20', NULL),
(5, 2, '2025-08-20', NULL),
(6, 2, '2025-08-20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Homes`
--

CREATE TABLE `Homes` (
  `home_id` int(11) NOT NULL,
  `join_code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Homes`
--

INSERT INTO `Homes` (`home_id`, `join_code`, `name`, `address`) VALUES
(1, 'UVA-CS-25', 'The Jefferson House', '1400 Wertland St, Charlottesville, VA 22903'),
(2, 'HOOS-ENG-26', 'The Corner Spot', '1501 University Ave, Charlottesville, VA 22903');

-- --------------------------------------------------------

--
-- Table structure for table `Landlord`
--

CREATE TABLE `Landlord` (
  `landlord_id` int(11) NOT NULL,
  `landlord_name` varchar(255) NOT NULL,
  `landlord_contact` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Landlord`
--

INSERT INTO `Landlord` (`landlord_id`, `landlord_name`, `landlord_contact`) VALUES
(1, 'Charlottesville Property Mgmt', '434-555-0199'),
(2, 'Southwood Realty', '434-555-0210');

-- --------------------------------------------------------

--
-- Table structure for table `Lease`
--

CREATE TABLE `Lease` (
  `lease_id` int(11) NOT NULL,
  `home_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `monthly_rent` decimal(10,2) NOT NULL,
  `landlord_id` int(11) NOT NULL
) ;

--
-- Dumping data for table `Lease`
--

INSERT INTO `Lease` (`lease_id`, `home_id`, `start_date`, `end_date`, `monthly_rent`, `landlord_id`) VALUES
(1, 1, '2025-08-01', '2026-07-31', '2400.00', 1),
(2, 2, '2025-08-15', '2026-07-31', '2750.00', 2);

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `billing_info` varchar(255) DEFAULT NULL,
  `profile_link` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`user_id`, `name`, `email`, `password`, `phone_number`, `billing_info`, `profile_link`) VALUES
(1, 'Alex Chen', 'alex.chen@example.com', 'hash1', '434-555-0101', 'Visa ending in 1234', 'linkedin.com/in/alexchen'),
(2, 'Brenda Garcia', 'brenda.g@example.com', 'hash2', '434-555-0102', 'Venmo @BrendaG', 'linkedin.com/in/brendagarcia'),
(3, 'Charlie Davis', 'cdavis@example.com', 'hash3', '434-555-0103', 'CashApp $CharlieD', 'linkedin.com/in/charliedavis'),
(4, 'Dana Smith', 'dana.s@example.com', 'hash4', '434-555-0104', 'PayPal dana.smith', 'linkedin.com/in/danasmith'),
(5, 'Evan Williams', 'evan.w@example.com', 'hash5', '434-555-0105', 'Zelle 434-555-0105', 'linkedin.com/in/evanwilliams'),
(6, 'Fiona Kim', 'fiona.k@example.com', 'hash6', '434-555-0106', 'Venmo @FionaKim', 'linkedin.com/in/fionakim'),
(7, 'George Lee', 'george.l@example.com', 'hash7', '434-555-0107', NULL, 'linkedin.com/in/georgelee');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Bill`
--
ALTER TABLE `Bill`
  ADD PRIMARY KEY (`bill_id`),
  ADD KEY `home_id` (`home_id`),
  ADD KEY `payer_user_id` (`payer_user_id`);

--
-- Indexes for table `BillShare`
--
ALTER TABLE `BillShare`
  ADD PRIMARY KEY (`bill_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `Chore`
--
ALTER TABLE `Chore`
  ADD PRIMARY KEY (`chore_id`),
  ADD KEY `home_id` (`home_id`);

--
-- Indexes for table `ChoreAssignment`
--
ALTER TABLE `ChoreAssignment`
  ADD PRIMARY KEY (`chore_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `EmergencyContact`
--
ALTER TABLE `EmergencyContact`
  ADD PRIMARY KEY (`contact_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `Event`
--
ALTER TABLE `Event`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `home_id` (`home_id`),
  ADD KEY `created_by_user_id` (`created_by_user_id`);

--
-- Indexes for table `EventInvite`
--
ALTER TABLE `EventInvite`
  ADD PRIMARY KEY (`event_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `HomeMembership`
--
ALTER TABLE `HomeMembership`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `home_id` (`home_id`);

--
-- Indexes for table `Homes`
--
ALTER TABLE `Homes`
  ADD PRIMARY KEY (`home_id`),
  ADD UNIQUE KEY `join_code` (`join_code`);

--
-- Indexes for table `Landlord`
--
ALTER TABLE `Landlord`
  ADD PRIMARY KEY (`landlord_id`),
  ADD UNIQUE KEY `landlord_contact` (`landlord_contact`);

--
-- Indexes for table `Lease`
--
ALTER TABLE `Lease`
  ADD PRIMARY KEY (`lease_id`,`home_id`),
  ADD KEY `home_id` (`home_id`),
  ADD KEY `landlord_id` (`landlord_id`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone_number` (`phone_number`),
  ADD UNIQUE KEY `profile_link` (`profile_link`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Bill`
--
ALTER TABLE `Bill`
  MODIFY `bill_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Chore`
--
ALTER TABLE `Chore`
  MODIFY `chore_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `EmergencyContact`
--
ALTER TABLE `EmergencyContact`
  MODIFY `contact_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `Event`
--
ALTER TABLE `Event`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Homes`
--
ALTER TABLE `Homes`
  MODIFY `home_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `Landlord`
--
ALTER TABLE `Landlord`
  MODIFY `landlord_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `Lease`
--
ALTER TABLE `Lease`
  MODIFY `lease_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Bill`
--
ALTER TABLE `Bill`
  ADD CONSTRAINT `Bill_ibfk_1` FOREIGN KEY (`home_id`) REFERENCES `Homes` (`home_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Bill_ibfk_2` FOREIGN KEY (`payer_user_id`) REFERENCES `Users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `BillShare`
--
ALTER TABLE `BillShare`
  ADD CONSTRAINT `BillShare_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `Bill` (`bill_id`),
  ADD CONSTRAINT `BillShare_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

--
-- Constraints for table `Chore`
--
ALTER TABLE `Chore`
  ADD CONSTRAINT `Chore_ibfk_1` FOREIGN KEY (`home_id`) REFERENCES `Homes` (`home_id`) ON DELETE CASCADE;

--
-- Constraints for table `ChoreAssignment`
--
ALTER TABLE `ChoreAssignment`
  ADD CONSTRAINT `ChoreAssignment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ChoreAssignment_ibfk_2` FOREIGN KEY (`chore_id`) REFERENCES `Chore` (`chore_id`) ON DELETE CASCADE;

--
-- Constraints for table `EmergencyContact`
--
ALTER TABLE `EmergencyContact`
  ADD CONSTRAINT `EmergencyContact_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `Event`
--
ALTER TABLE `Event`
  ADD CONSTRAINT `Event_ibfk_1` FOREIGN KEY (`home_id`) REFERENCES `Homes` (`home_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Event_ibfk_2` FOREIGN KEY (`created_by_user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `EventInvite`
--
ALTER TABLE `EventInvite`
  ADD CONSTRAINT `EventInvite_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `EventInvite_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `HomeMembership`
--
ALTER TABLE `HomeMembership`
  ADD CONSTRAINT `HomeMembership_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `HomeMembership_ibfk_2` FOREIGN KEY (`home_id`) REFERENCES `Homes` (`home_id`) ON DELETE CASCADE;

--
-- Constraints for table `Lease`
--
ALTER TABLE `Lease`
  ADD CONSTRAINT `Lease_ibfk_1` FOREIGN KEY (`home_id`) REFERENCES `Homes` (`home_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Lease_ibfk_2` FOREIGN KEY (`landlord_id`) REFERENCES `Landlord` (`landlord_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
