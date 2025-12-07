import { pool } from "./pool.js";

export async function getUsersAssignedToChore(chore_id) {
    const [result] = await pool.query(
        "SELECT u.*, ca.status FROM ChoreAssignment AS ca INNER JOIN User AS u ON ca.user_id=u.user_id WHERE ca.chore_id = ?",
        [chore_id]
    );
    return result;
}

export async function getChoresAssignedToUser(user_id) {
    const [result] = await pool.query(
        "SELECT c.*, ca.status FROM ChoreAssignment AS ca INNER JOIN Chore AS c ON ca.chore_id=c.chore_id WHERE ca.user_id = ?",
        [user_id]
    );
    return result;
}

export async function assignChoreToUser(chore_id, user_id, status) {
    const [result] = await pool.query(
        "INSERT INTO ChoreAssignment (chore_id, user_id, status) VALUES (?, ?, ?)",
        [chore_id, user_id, status]
    );
    return result;
}

export async function updateChoreAssignmentStatus(chore_id, user_id, status) {
    const [result] = await pool.query(
        "UPDATE ChoreAssignment SET status = ? WHERE chore_id = ? AND user_id = ?",
        [status, chore_id, user_id]
    );
    return result;
}

export async function removeChoreAssignment(chore_id, user_id) {
    const [result] = await pool.query(
        "DELETE FROM ChoreAssignment WHERE chore_id = ? AND user_id = ?",
        [chore_id, user_id]
    );
    return result;
}

export async function getChoresForHome(home_id) {
    const [result] = await pool.query(
        `SELECT 
            c.chore_id,
            c.description,
            ca.user_id,
            ca.status
        FROM Chore AS c
        LEFT JOIN ChoreAssignment AS ca 
            ON ca.chore_id = c.chore_id
        WHERE c.home_id = ?`,
        [home_id]
    );
    return result;
}