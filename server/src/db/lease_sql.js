import { pool } from "../db/pool.js";

// again not sure how impotant this is but including bc both are in pkey
export async function getLeaseByID(lease_id, home_id) {
    const [result] = await pool.query(
        "SELECT * FROM Lease WHERE lease_id = ? AND home_id = ?",
        [lease_id, home_id]
    );
    return result;
}

// prob much more useful
export async function getLeaseByHomeID(home_id) {
    const [result] = await pool.query(
        "SELECT * FROM Lease WHERE home_id = ?",
        [home_id]
    );
    return result;
}

export async function getLeasesByLandlordID(landlord_id) {
    const [result] = await pool.query(
        "SELECT * FROM Lease AS le INNER JOIN Landlord AS la ON le.landlord_id = la.landlord_id WHERE la.landlord_id = ?",
        [landlord_id]
    );
    return result;
}

export async function addLease(home_id, start_date, end_date, monthly_rent, landlord_id) {
    const [result] = await pool.query(
        "INSERT INTO Lease (home_id, start_date, end_date, monthly_rent, landlord_id) VALUES (?, ?, ?, ?, ?)",
        [home_id, start_date, end_date, monthly_rent, landlord_id]
    );
    return result;
}

export async function updateLease(lease_id, home_id, start_date, end_date, monthly_rent, landlord_id) {
    const [result] = await pool.query(
        "UPDATE Lease SET start_date = ?, end_date = ?, monthly_rent = ?, landlord_id = ? WHERE lease_id = ? AND home_id = ?",
        [start_date, end_date, monthly_rent, landlord_id, lease_id, home_id]
    );
    return result;
}

export async function deleteLease(lease_id, home_id) {
    const [result] = await pool.query(
        "DELETE FROM Lease WHERE lease_id = ? AND home_id = ?",
        [lease_id, home_id]
    );
    return result;
}