INSERT INTO Users (name, email, password, phone_number, billing_info, profile_link) VALUES (:name, :email, :password, :phone_number, :billing_info, :profile_link);
SELECT * FROM Users; -- if we we want multiple users being listed out (probably not tho)
SELECT * FROM Users WHERE user_id=:user_id; -- if we want a specific user (more applicable)
UPDATE Users SET name=:name, email=:email, password=:password, phone_number=:phone_number, billing_info=:billing_info, profile_link=:profile_link WHERE user_id=:user_id;
DELETE FROM Users WHERE user_id=:user_id;
