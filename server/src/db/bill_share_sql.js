import { pool } from "./pool.js";

export async function getBillsForUser(user_id) {
    const [result] = await pool.query(
        "SELECT b.*, bs.status FROM BillShare AS bs INNER JOIN Bill AS b ON bs.bill_id=b.bill_id WHERE bs.user_id = ?",
        [user_id]
    );
    return result;
}

export async function getUsersForBill(bill_id) {
    const [result] = await pool.query(
        "SELECT u.*, bs.status FROM BillShare AS bs INNER JOIN User AS u ON bs.user_id=u.user_id WHERE bs.bill_id = ?",
        [bill_id, user_id]
    );
    return result;
}

export async function assignBillToUser(bill_id, user_id, amount_due, status) {
    const [result] = await pool.query(
        "INSERT INTO BillShare (bill_id, user_id, amount_due, status) VALUES (?, ?, ?, ?)",
        [bill_id, user_id, amount_due, status]
    );
    return result;
}

export async function updateBillShare(bill_id, user_id, amount_due, status) {
    const [result] = await pool.query(
        "UPDATE BillShare SET amount_due = ?, status = ? WHERE bill_id = ? AND user_id = ?",
        [amount_due, status, bill_id, user_id]
    );
    return result;
}

export async function removeBillShare(bill_id, user_id) {
    const [result] = await pool.query(
        "DELETE FROM BillShare WHERE bill_id = ? AND user_id = ?",
        [bill_id, user_id]
    );
    return result;
}

// ADVANCED SQL ONE TO CALL THE STORED PROCEDURE
export async function splitBill(bill_id) {
    const [result] = await pool.query(
        "CALL split_bill(?)",
        [bill_id]
    );
    return result;
}