import { pool } from "./pool.js";

export async function getEventByID(event_id) {
    const [result] = await pool.query(
        "SELECT * FROM Event WHERE event_id = ?",
        [event_id]
    );
    return result;
}

export async function getEventsByHomeID(home_id) {
    const [result] = await pool.query(
        "SELECT * FROM Event WHERE home_id = ?",
        [home_id]
    );
    return result;
}

export async function getEventInfoAndCreatorByHomeID(home_id) {
    const [result] = await pool.query(
        "SELECT e.*, u.name AS created_by FROM Event AS e INNER JOIN User AS u ON e.created_by_user_id=u.user_id WHERE e.home_id = ?",
        [home_id]
    );
    return result;
}

export async function addEvent(home_id, title, description, event_start, event_end, created_by_user_id) {
    const [result] = await pool.query(
        "INSERT INTO Event (home_id, title, description, event_start, event_end, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?)",
        [home_id, title, description, event_start, event_end, created_by_user_id]
    );
    return result;
}

export async function updateEvent(event_id, title, description, event_start, event_end) {
    const [result] = await pool.query(
        "UPDATE Event SET title = ?, description = ?, event_start = ?, event_end = ? WHERE event_id = ?",
        [title, description, event_start, event_end, event_id]
    );
    return result;
}

export async function deleteEvent(event_id) {
    const [result] = await pool.query(
        "DELETE FROM Event WHERE event_id = ?",
        [event_id]
    );
    return result;
}