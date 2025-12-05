import { pool } from "./pool.js";

export async function getLandlordByID(landlord_id) {
    const [result] = await pool.query(
        "SELECT * FROM Landlords WHERE landlord_id = ?",
        [landlord_id]
    );
    return result;
}

// i just thought of this but maybe a good func to have
export async function getLandlordByHomeID(home_id) {
    const [result] = await pool.query(
        "SELECT la.* FROM Landlords AS la INNER JOIN Lease AS le ON la.landlord_id=le.landlord_id WHERE le.home_id = ?",
        [home_id]
    );
    return result;
}

export async function addLandlord(name, email, contact) {
    const [result] = await pool.query(
        "INSERT INTO Landlords (name, email, landlord_contact) VALUES (?, ?, ?)",
        [name, email, contact]
    );
    return result;
}

export async function updateLandlord(landlord_id, name, email, contact) {
    const [result] = await pool.query(
        "UPDATE Landlords SET name = ?, email = ?, landlord_contact = ? WHERE landlord_id = ?",
        [name, email, contact, landlord_id]
    );
    return result;
}

export async function deleteLandlord(landlord_id) {
    const [result] = await pool.query(
        "DELETE FROM Landlords WHERE landlord_id = ?",
        [landlord_id]
    );
    return result;
}