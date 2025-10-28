ALTER TABLE Lease
  ADD CONSTRAINT chk_lease_dates CHECK (end_date > start_date);

ALTER TABLE Lease
  ADD CONSTRAINT chk_lease_rent CHECK (monthly_rent > 0);

ALTER TABLE `Event`
  ADD CONSTRAINT chk_event_times CHECK (event_end > event_start);

ALTER TABLE Bill
  ADD CONSTRAINT chk_bill_total CHECK (total_amount > 0);

ALTER TABLE BillShare
  ADD CONSTRAINT chk_billshare_amount CHECK (amount_due > 0);
  
ALTER TABLE BillShare
  ADD CONSTRAINT chk_billshare_status CHECK (`status` IN ('unpaid', 'partial', 'paid'));

ALTER TABLE ChoreAssignment
  ADD CONSTRAINT chk_chore_status CHECK (`status` IN ('pending', 'in_progress', 'done'));