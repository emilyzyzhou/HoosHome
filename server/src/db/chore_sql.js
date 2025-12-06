import { pool } from "./pool.js";

export async function getChoreByID(chore_id) {
    const [result] = await pool.query(
        "SELECT * FROM Chore WHERE chore_id = ?",
        [chore_id]
    );
    return result;
}

export async function getChoresByHomeID(home_id) {
    const [result] = await pool.query(
        "SELECT * FROM Chore WHERE home_id = ?",
        [home_id]
    );
    return result;
}

export async function addChore(home_id, title, description, due_date, recurrence) {
    const [result] = await pool.query(
        "INSERT INTO Chore (home_id, title, description, due_date, recurrence) VALUES (?, ?, ?, ?, ?)",
        [home_id, title, description, due_date, recurrence]
    );
    return result;
}

export async function updateChore(chore_id, title, description, due_date, recurrence) {
    const [result] = await pool.query(
        "UPDATE Chore SET title = ?, description = ?, due_date = ?, recurrence = ? WHERE chore_id = ?",
        [title, description, due_date, recurrence, chore_id]
    );
    return result;
}

export async function deleteChore(chore_id) {
    const [result] = await pool.query(
        "DELETE FROM Chore WHERE chore_id = ?",
        [chore_id]
    );
    return result;
}