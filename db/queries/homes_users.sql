INSERT INTO HomeMembership (home_id, user_id, start_date, end_date) VALUES (:home_id, :user_id, :start_date, :end_date);
SELECT u.* FROM HomeMembership AS hm INNER JOIN Users AS u ON hm.user_id = u.user_id WHERE hm.home_id=:home_id; -- retrieval of all users in a specified home
SELECT h.* FROM HomeMembership AS hm INNER JOIN Homes AS h ON hm.home_id=h.home_id WHERE hm.user_id=:user_id; -- retrieval of all homes a specified user belongs to 
UPDATE HomeMembership SET start_date=:start_date, end_date=:end_date WHERE home_id=:home_id AND user_id=:user_id;
DELETE FROM HomeMembership WHERE home_id=:home_id AND user_id=:user_id;
