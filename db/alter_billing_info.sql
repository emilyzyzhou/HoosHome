-- Alter Users table to split billing_info into payment_method and payment_handle
ALTER TABLE Users 
ADD COLUMN payment_method ENUM('Venmo', 'Zelle', 'PayPal') DEFAULT NULL,
ADD COLUMN payment_handle VARCHAR(255) DEFAULT NULL;

-- also drop the old billing_info column after migration
ALTER TABLE Users DROP COLUMN billing_info;
