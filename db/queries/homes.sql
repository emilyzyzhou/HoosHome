INSERT INTO Homes (join_code, name, address) VALUES (:join_code, :name, :address);
SELECT * FROM Homes WHERE home_id=:home_id; -- just get the homes by home id; the join to users happens with HomeMembership related queries
SELECT * FROM Homes WHERE join_code=:join_code;-- just realized but I think this should be helpful since we need to grab the home_id when the user puts in a join code for the home. Works because join_codes are also unique
UPDATE Homes SET join_code=:join_code, name=:name, address=:address WHERE home_id=:home_id;
DELETE FROM Homes WHERE home_id=:home_id;
