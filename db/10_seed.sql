-- 1. Populate Users
INSERT INTO Users (user_id, name, email, `password`, phone_number, billing_info, profile_link) VALUES
(1, 'Alex Chen', 'alex.chen@example.com', 'hash1', '434-555-0101', 'Visa ending in 1234', 'linkedin.com/in/alexchen'),
(2, 'Brenda Garcia', 'brenda.g@example.com', 'hash2', '434-555-0102', 'Venmo @BrendaG', 'linkedin.com/in/brendagarcia'),
(3, 'Charlie Davis', 'cdavis@example.com', 'hash3', '434-555-0103', 'CashApp $CharlieD', 'linkedin.com/in/charliedavis'),
(4, 'Dana Smith', 'dana.s@example.com', 'hash4', '434-555-0104', 'PayPal dana.smith', 'linkedin.com/in/danasmith'),
(5, 'Evan Williams', 'evan.w@example.com', 'hash5', '434-555-0105', 'Zelle 434-555-0105', 'linkedin.com/in/evanwilliams'),
(6, 'Fiona Kim', 'fiona.k@example.com', 'hash6', '434-555-0106', 'Venmo @FionaKim', 'linkedin.com/in/fionakim'),
(7, 'George Lee', 'george.l@example.com', 'hash7', '434-555-0107', NULL, 'linkedin.com/in/georgelee'); -- User without a home

-- 2. Populate Emergency Contacts
INSERT INTO EmergencyContact (user_id, name, email, phone_number, relation_to_user) VALUES
(1, 'David Chen', 'd.chen@example.com', '202-555-0155', 'Father'),
(2, 'Maria Garcia', 'm.garcia@example.com', '305-555-0144', 'Mother'),
(3, 'Sarah Davis', 'sarahd@example.com', '804-555-0188', 'Sister'),
(4, 'Tom Smith', 'tom.s@example.com', '434-555-0121', 'Brother'),
(6, 'Jin Kim', 'jin.kim@example.com', '571-555-0133', 'Cousin');

-- 3. Populate Homes
INSERT INTO Homes (home_id, join_code, name, address) VALUES
(1, 'UVA-CS-25', 'The Jefferson House', '1400 Wertland St, Charlottesville, VA 22903'),
(2, 'HOOS-ENG-26', 'The Corner Spot', '1501 University Ave, Charlottesville, VA 22903');

-- 4. Populate HomeMembership
INSERT INTO HomeMembership (user_id, home_id, start_date, end_date) VALUES
(1, 1, '2025-08-15', NULL),
(2, 1, '2025-08-15', NULL),
(3, 1, '2025-08-15', NULL),
(4, 2, '2025-08-20', NULL),
(5, 2, '2025-08-20', NULL),
(6, 2, '2025-08-20', NULL);


-- 5. Populate Landlords
INSERT INTO Landlord (landlord_id, landlord_name, landlord_contact) VALUES
(1, 'Charlottesville Property Mgmt', '434-555-0199'),
(2, 'Southwood Realty', '434-555-0210');

-- 6. Populate Leases
INSERT INTO Lease (lease_id, home_id, start_date, end_date, monthly_rent, landlord_id) VALUES
(1, 1, '2025-08-01', '2026-07-31', 2400.00, 1),
(2, 2, '2025-08-15', '2026-07-31', 2750.00, 2);

-- 7. Populate Chores
INSERT INTO Chore (chore_id, home_id, title, description, due_date, recurrence) VALUES
(1, 1, 'Take out trash & recycling', 'All bins to the curb for Tuesday morning pickup.', '2025-10-28', 'Weekly'),
(2, 1, 'Clean kitchen', 'Wipe counters, sweep floor, and clean sink.', '2025-10-26', 'Weekly'),
(3, 1, 'Clean main bathroom', 'Clean toilet, shower, and sink.', '2025-10-27', 'Weekly'),
(4, 2, 'Vacuum common areas', 'Living room and hallway.', '2025-10-29', 'Weekly'),
(5, 2, 'Take out compost', 'Take kitchen compost bin to the outdoor pile.', '2025-10-30', 'Weekly'),
(6, 1, 'Water the plants', 'Living room and kitchen plants.', '2025-11-01', 'Bi-Weekly'),
(7, 2, 'Wipe down appliances', 'Microwave, toaster, and coffee maker.', '2025-10-28', 'Weekly');

-- 8. Populate ChoreAssignments (with corrected FK to `Chore`)
INSERT INTO ChoreAssignment (chore_id, user_id, `status`) VALUES
(1, 3, 'completed'),
(2, 1, 'in progress'),
(3, 2, 'pending'),
(4, 5, 'completed'),
(5, 6, 'pending'),
(7, 4, 'pending');
-- Chore 6 is unassigned

-- 9. Populate Bills
INSERT INTO Bill (bill_id, home_id, description, bill_type, total_amount, due_date, payer_user_id, split_rule) VALUES
(1, 1, 'October Internet', 'Utility', 65.00, '2025-10-30', 1, 'Split Equally'),
(2, 1, 'October Electric', 'Utility', 112.50, '2025-11-05', 2, 'Split Equally'),
(3, 2, 'October Gas', 'Utility', 45.00, '2025-11-08', 4, 'Split Equally'),
(4, 2, 'Weekly Groceries', 'Groceries', 150.00, '2025-10-26', 5, 'Split Equally'),
(5, 1, 'November Rent', 'Rent', 2400.00, '2025-11-01', 1, 'Split Equally'),
(6, 2, 'Internet Bill', 'Utility', 75.00, '2025-11-01', 6, 'Split Equally'),
(7, 1, 'Pizza Night', 'Food', 42.00, '2025-10-25', 3, 'Split Equally');

-- 10. Populate BillShares

INSERT INTO BillShare (bill_id, user_id, amount_due, `status`) VALUES
(1, 1, 21.67, 'paid'), (1, 2, 21.67, 'unpaid'), (1, 3, 21.66, 'unpaid');
INSERT INTO BillShare (bill_id, user_id, amount_due, `status`) VALUES
(2, 1, 37.50, 'unpaid'), (2, 2, 37.50, 'paid'), (2, 3, 37.50, 'unpaid');
INSERT INTO BillShare (bill_id, user_id, amount_due, `status`) VALUES
(3, 4, 15.00, 'paid'), (3, 5, 15.00, 'unpaid'), (3, 6, 15.00, 'unpaid');
INSERT INTO BillShare (bill_id, user_id, amount_due, `status`) VALUES
(4, 4, 50.00, 'unpaid'), (4, 5, 50.00, 'paid'), (4, 6, 50.00, 'paid');
INSERT INTO BillShare (bill_id, user_id, amount_due, `status`) VALUES
(5, 1, 800.00, 'paid'), (5, 2, 800.00, 'unpaid'), (5, 3, 800.00, 'unpaid');
INSERT INTO BillShare (bill_id, user_id, amount_due, `status`) VALUES
(6, 4, 25.00, 'unpaid'), (6, 5, 25.00, 'unpaid'), (6, 6, 25.00, 'paid');
INSERT INTO BillShare (bill_id, user_id, amount_due, `status`) VALUES
(7, 1, 14.00, 'paid'), (7, 2, 14.00, 'unpaid'), (7, 3, 14.00, 'paid');

-- 11. Populate Events
INSERT INTO `Event` (event_id, home_id, title, description, event_start, event_end, created_by_user_id) VALUES
(1, 1, 'Project Milestone Celebration', 'We finished the database project! Let''s order pizza.', '2025-10-25 19:00:00', '2025-10-25 22:00:00', 1),
(2, 2, 'House Meeting', 'Discuss chore schedule and upcoming bills.', '2025-10-26 18:00:00', '2025-10-26 18:30:00', 4),
(3, 1, 'Movie Night', 'Watching the new Dune movie in the living room.', '2025-10-31 20:00:00', '2025-10-31 23:00:00', 2),
(4, 2, 'Group Study Session', 'Midterm prep for CS 3140 in the dining room.', '2025-11-02 14:00:00', '2025-11-02 17:00:00', 6),
(5, 1, 'Game Night', 'Board games and snacks.', '2025-11-07 19:30:00', '2025-11-07 23:00:00', 3);

-- 12. Populate EventInvites
INSERT INTO EventInvite (event_id, user_id, rsvp_status) VALUES
(1, 1, 'attending'), (1, 2, 'attending'), (1, 3, 'maybe');
INSERT INTO EventInvite (event_id, user_id, rsvp_status) VALUES
(2, 4, 'attending'), (2, 5, 'attending'), (2, 6, 'attending');
INSERT INTO EventInvite (event_id, user_id, rsvp_status) VALUES
(3, 1, 'attending'), (3, 2, 'attending'), (3, 3, 'declined');
INSERT INTO EventInvite (event_id, user_id, rsvp_status) VALUES
(4, 4, 'pending'), (4, 5, 'attending'), (4, 6, 'attending');
INSERT INTO EventInvite (event_id, user_id, rsvp_status) VALUES
(5, 1, 'pending'), (5, 2, 'pending'), (5, 3, 'pending');

