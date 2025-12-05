import { pool } from "./pool.js";

export async function getAllUsersInHome(home_id) {
    const [result] = await pool.query(
        "SELECT u.* FROM HomeMembership AS hm INNER JOIN Users AS u ON hm.user_id=u.user_id WHERE home_id = ?",
        [home_id]
    );
    return result;
}

export async function getAllHomesForUser(user_id) {
    const [result] = await pool.query(
        "SELECT h.* FROM HomeMembership AS hm INNER JOIN Homes AS h ON hm.home_id=h.home_id WHERE user_id = ?",
        [user_id]
    );
    return result;
}

export async function addUserToHome(home_id, user_id, start_date, end_date) {
    const [result] = await pool.query(
        "INSERT INTO HomeMembership (home_id, user_id, start_date, end_date) VALUES (?, ?, ?, ?)",
        [home_id, user_id, start_date, end_date ?? null]
    );
    return result;
}

export async function updateUserMembershipInHome(home_id, user_id, start_date, end_date) {
    const [result] = await pool.query(
        "UPDATE HomeMembership SET start_date = ?, end_date = ? WHERE home_id = ? AND user_id = ?",
        [start_date, end_date ?? null, home_id, user_id]
    );
    return result;
}

export async function deleteUserFromHome(home_id, user_id) {
    const [result] = await pool.query(
        "DELETE FROM HomeMembership WHERE home_id = ? AND user_id = ?",
        [home_id, user_id]
    );
    return result;
}