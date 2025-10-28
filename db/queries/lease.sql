INSERT INTO Lease (home_id, start_date, end_date, monthly_rent, landlord_id) VALUES (:home_id, :start_date, :end_date, :monthly_rent, :landlord_id);
SELECT * FROM Lease WHERE lease_id=:lease_id AND home_id=:home_id; -- retrieval of lease by lease id
SELECT * FROM Lease WHERE home_id=:home_id; -- retrieval of leases for a specified home
UPDATE Lease SET start_date=:start_date, end_date=:end_date, monthly_rent=:monthly_rent, landlord_id=:landlord_id WHERE lease_id=:lease_id AND home_id=:home_id;
DELETE FROM Lease WHERE lease_id=:lease_id AND home_id=:home_id; -- also weak entity, think I need to specify both
SELECT * FROM Lease AS le INNER JOIN Landlord AS la ON le.landlord_id = la.landlord_id WHERE la.landlord_id=:landlord_id;
