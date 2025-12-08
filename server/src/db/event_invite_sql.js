import { pool } from "./pool.js";

export async function getUsersInvitedToEvent(event_id) {
    const [result] = await pool.query(
        "SELECT ei.event_id, ei.user_id, ei.rsvp_status, u.name FROM EventInvite AS ei INNER JOIN Users AS u ON ei.user_id=u.user_id WHERE ei.event_id = ?",
        [event_id]
    );
    return result;
}

export async function getEventsUserIsInvitedTo(user_id) {
    const [result] = await pool.query(
        "SELECT ei.*, e.title, e.description, e.event_start, e.event_end FROM EventInvite AS ei INNER JOIN Event AS e ON ei.event_id=e.event_id WHERE ei.user_id = ?",
        [user_id]
    );
    return result;
}

export async function getEventsUserCreated(user_id) {
    const [result] = await pool.query(
        "SELECT ei.*, e.event_id, e.title, e.description, e.event_start, e.event_end FROM EventInvite AS ei RIGHT JOIN Event AS e ON ei.event_id=e.event_id WHERE e.created_by_user_id = ?",
        [user_id]
    );
    return result;
}

export async function inviteUserToEvent(event_id, user_id, rsvp_status) {
    const [result] = await pool.query(
        "INSERT INTO EventInvite (event_id, user_id, rsvp_status) VALUES (?, ?, ?)",
        [event_id, user_id, rsvp_status]
    );
    return result;
}

export async function updateEventInvite(event_id, user_id, rsvp_status) {
    const [result] = await pool.query(
        "UPDATE EventInvite SET rsvp_status = ? WHERE event_id = ? AND user_id = ?",
        [rsvp_status, event_id, user_id]
    );
    return result;
}
export async function removeEventInvite(event_id, user_id) {
    const [result] = await pool.query(
        "DELETE FROM EventInvite WHERE event_id = ? AND user_id = ?",
        [event_id, user_id]
    );
    return result;
}