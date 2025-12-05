import { pool } from "../db/pool.js";

export async function getHomeByID(home_id) {
    const [result] = await pool.query(
        "SELECT * FROM Homes WHERE home_id = ?",
        [home_id]
    );
    return result;
}

export async function getHomeByJoinCode(join_code) {
    const [result] = await pool.query(
        "SELECT * FROM Homes WHERE join_code = ?",
        [join_code]
    );
    return result;
}

export async function addHome(join_code, name, address) {
    const [result] = await pool.query(
        "INSERT INTO Homes (join_code, name, address) VALUES (?, ?, ?)",
        [join_code, name, address]
    );
    return result;
}

// intentionally doesn't allow join code to be updated but can include that
export async function updateHome(home_id, name, address) {
    const [result] = await pool.query(
        "UPDATE Homes SET name = ?, address = ? WHERE home_id = ?",
        [name, address, home_id]
    );
    return result;
}

export async function deleteHome(home_id) {
    const[result] = await pool.query(
        "DELETE FROM Homes WHERE home_id = ?",
        [home_id]
    );
    return result;
}