import { pool } from "./pool.js";

export async function getBillByID(bill_id) {
    const [result] = await pool.query(
        "SELECT * FROM Bill WHERE bill_id = ?",
        [bill_id]
    );
    return result;
}

export async function getBillByHome(home_id) {
    const [result] = await pool.query(
        "SELECT * FROM Bill WHERE home_id = ?",
        [home_id]
    );
    return result;
}

export async function getBillByPayer(payer_id, home_id) {
    const [result] = await pool.query(
        "SELECT b.*, u.name AS payer_name FROM Bill AS b INNER JOIN User AS u ON b.payer_user_id=u.user_id WHERE b.payer_user_id = ? AND b.home_id = ?",
        [payer_id, home_id]
    );
    return result;
}

export async function createBill(home_id, description, bill_type, total_amount, due_date, payer_user_id, split_rule) {
    const [result] = await pool.query(
        "INSERT INTO Bill (home_id, description, bill_type, total_amount, due_date, payer_user_id, split_rule) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [home_id, description, bill_type, total_amount, due_date, payer_user_id, split_rule]
    );
    return result;
}

export async function updateBill(bill_id, description, bill_type, total_amount, due_date, payer_user_id, split_rule) {
    const [result] = await pool.query(
        "UPDATE Bill SET description = ?, bill_type = ?, total_amount = ?, due_date = ?, payer_user_id = ?, split_rule = ? WHERE bill_id = ?",
        [home_id, description, bill_type, total_amount, due_date, payer_user_id, split_rule, bill_id]
    );
    return result;
}

export async function deleteBill(bill_id) {
    const [result] = await pool.query(
        "DELETE FROM Bill WHERE bill_id = ?",
        [bill_id]
    );
    return result;
}