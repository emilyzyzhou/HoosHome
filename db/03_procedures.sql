DELIMITER //

CREATE PROCEDURE split_bill(IN p_bill_id INT)
BEGIN
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
END //

DELIMITER ;
