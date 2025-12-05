import { pool } from "./pool.js";

export async function getEmergencyContactsByUserID(user_id) {
    const [result] = await pool.query(
        "SELECT * FROM EmergencyContact WHERE user_id = ?",
        [user_id]
    );
    return result;
}

// idk why you'd need this to be honest but just keeping it since it was in milestone 2
export async function getEmergencyContactsByUserIDAndContactID(user_id, contact_id) {
    const [result] = await pool.query(
        "SELECT * FROM EmergencyContact WHERE user_id = ? AND contact_id = ?",
        [user_id, contact_id]
    );
    return result;
}

export async function addEmergencyContact(user_id, name, email, phone_number, relationship) {
    const [result] = await pool.query(
        "INSERT INTO EmergencyContact (user_id, name, email, phone_number, relation_to_user) VALUES (?, ?, ?, ?, ?)",
        [user_id, name, email ?? null, phone_number, relationship ?? null]
    );
    return result;
}

export async function updateEmergencyContact(user_id, contact_id, name, email, phone_number, relationship) {
    const [result] = await pool.query(
        "UPDATE EmergencyContact SET name = ?, email = ?, phone_number = ?, relation_to_user = ? WHERE user_id = ? AND contact_id = ?",
        [name, email ?? null, phone_number, relationship ?? null, user_id, contact_id]
    );
    return result;
}

export async function deleteEmergencyContact(user_id, contact_id) {
    const [result] = await pool.query(
        "DELETE FROM EmergencyContact WHERE user_id = ? AND contact_id = ?",
        [user_id, contact_id]
    );
    return result;
}