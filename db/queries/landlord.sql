INSERT INTO Landlord (landlord_name, landlord_contact) VALUES (:landlord_name, :landlord_contact);
SELECT * FROM Landlord WHERE landlord_id=:landlord_id;
UPDATE Landlord SET landlord_name=:landlord_name, landlord_contact=:landlord_contact WHERE landlord_id=:landlord_id;
DELETE FROM Landlord WHERE landlord_id=:landlord_id;
