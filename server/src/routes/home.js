import { Router } from "express";
import { pool } from "../db/pool.js";
import jwt from "jsonwebtoken";

function getUserIdFromRequest(req) {
  const token = req.cookies?.hh_token;
  if (!token) return null;
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  return payload.user_id;
}

const router = Router();

// POST /home/join
router.post("/join", async (req, res) => {
  let conn;
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated." });
    }

    const { joinCode } = req.body || {};
    if (!joinCode) {
      return res
        .status(400)
        .json({ success: false, message: "Join code is required." });
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Find home by join code
    const [rows] = await conn.query(
      "SELECT * FROM Homes WHERE join_code = ?",
      [joinCode]
    );

    const homes = rows; 

    if (homes.length > 0) {
      const home = homes[0];
      console.log("Found home:", home);
      return res.json({ success: true, home_id: home.home_id });
    } else {
      return res.status(404).json({ success: false, message: "Invalid join code." });
    }

    const home = rows[0];

    // Insert or ensure membership for this user in this home
    await conn.query(
      `INSERT INTO HomeMembership (home_id, user_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE home_id = home_id`,
      [home.id, userId]
    );

    await conn.commit();
    conn.release();

    console.log("User joined home:", { userId, homeId: home.id });

    return res.json({ success: true, home_id: home.id });
  } catch (error) {
    console.error("Home Join Error:", error);
    if (conn) {
      try {
        await conn.rollback();
        conn.release();
      } catch (_) {
        // ignore rollback errors
      }
    }
    return res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." });
  }
});

// POST /home/create-home
router.post("/create-home", async (req, res) => {
  let conn;
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated." });
    }

    const { homeName, homeAddress } = req.body || {};

    // validation
    if (!homeName || !homeAddress) {
      return res.status(400).json({
        success: false,
        message: "Home name and address are required.",
      });
    }

    // random 6-digit join code
    const joinCode = Math.floor(100000 + Math.random() * 900000).toString();

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Insert new home
    const [result] = await conn.query(
      "INSERT INTO Homes (name, address, join_code) VALUES (?, ?, ?)",
      [homeName, homeAddress, joinCode]
    );

    const insertId = result.insertId;

    // Insert membership for the creator
    await conn.query(
      `INSERT INTO HomeMembership (home_id, user_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE home_id = home_id`,
      [insertId, userId]
    );

    await conn.commit();
    conn.release();

    const affectedRows = result.affectedRows;

    if (affectedRows > 0) {
      return res.json({
        success: true,
        message: "New home created successfully!",
        newHome: {
          home_id: insertId,
          name: homeName,
          address: homeAddress,
          joinCode: joinCode,
        },
      });
    } else {
      throw new Error("No rows were affected. Insert failed.");
    }
  } catch (error) {
    console.error("Home Create Error:", error);
    if (conn) {
      try {
        await conn.rollback();
        conn.release();
      } catch (_) {
        // ignore rollback errors
      }
    }

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(500).json({
        success: false,
        message: "A duplicate join code was generated. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
    });
  }
});

// GET /home/roommates - Get all roommates in user's home
router.get("/roommates", async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get user's home_id
    const [userHome] = await pool.query(
      "SELECT home_id FROM HomeMembership WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (userHome.length === 0) {
      // User not in any home yet → no roommates
      return res.json({ roommates: [] });
    }

    const homeId = userHome[0].home_id;

    // Get all users in the same home
    const [roommates] = await pool.query(
      `SELECT u.user_id, u.name
       FROM Users u
       JOIN HomeMembership hm ON u.user_id = hm.user_id
       WHERE hm.home_id = ?
       ORDER BY u.name`,
      [homeId]
    );

    return res.json({ roommates });
  } catch (error) {
    console.error("Roommates fetch error:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
});

// GET /home/:homeId/users
router.get("/:homeId/users", async (req, res) => {
  try {
    const { homeId } = req.params;

    if (!homeId) {
      return res.status(400).json({ success: false, message: "Home ID is required." });
    }

    const [rows] = await pool.query(
      'SELECT user_id, name FROM Users natural join HomeMembership WHERE home_id = ?',
      [homeId]
    );

    res.json({ success: true, users: rows });
  } catch (error) {
    console.error("GET Home Users Error:", error);
    return res.status(500).json({ success: false, message: "An internal server error occurred while fetching users." });
  }
});

export default router;
