import { pool } from "./pool.js";

export async function getAllUsers() {
    const [result] = await pool.query("SELECT * FROM Users");
    return result;
}

export async function getUserByID(id) {
    const [result] = await pool.query(
        "SELECT * FROM Users WHERE user_id = ?",
        [id]
    );
    return result;
}

export async function addUser(name, email, hash, phone_number, billing_info, profile_link) {
    const [result] = await pool.query(
        "INSERT INTO Users (name, email, password, phone_number, billing_info, profile_link) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, hash, phone_number ?? null, billing_info ?? null, profile_link ?? null]
    );
    return result;
}

export async function updateUser(id, name, email, phone_number, billing_info, profile_link) {
    const [result] = await pool.query(
        "UPDATE Users SET name = ?, email = ?, phone_number = ?, billing_info = ?, profile_link = ? WHERE user_id = ?",
        [name, email, phone_number ?? null, billing_info ?? null, profile_link ?? null, id]
    );
    return result;
}

export async function deleteUser(id) {
    const [result] = await pool.query(
        "DELETE FROM Users WHERE user_id = ?",
        [id]
    );
    return result;
}