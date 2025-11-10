-- create the user for both localhost (socket) and TCP (127.0.0.1) use-cases
CREATE USER IF NOT EXISTS 'hooshome_user'@'localhost' IDENTIFIED BY 'STRONG_PASS_HERE';
CREATE USER IF NOT EXISTS 'hooshome_user'@'127.0.0.1' IDENTIFIED BY 'STRONG_PASS_HERE';

GRANT ALL PRIVILEGES ON hooshome.* TO 'hooshome_user'@'localhost';
GRANT ALL PRIVILEGES ON hooshome.* TO 'hooshome_user'@'127.0.0.1';

FLUSH PRIVILEGES;

-- sanity check
SELECT user, host, plugin FROM mysql.user WHERE user='hooshome_user';