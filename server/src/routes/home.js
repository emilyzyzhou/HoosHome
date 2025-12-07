import { Router } from "express";
import { pool } from "../db/pool.js";
import jwt from "jsonwebtoken";
import { getHomeByJoinCode } from "../db/home_sql.js";
import { addUserToHome, getAllHomesForUser, getAllUsersInHome } from "../db/home_membership_sql.js";
import { addHome } from "../db/home_sql.js";

function getUserIdFromRequest(req) {
  const token = req.cookies?.hh_token;
  if (!token) return null;
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  return payload.user_id;
}

const router = Router();

// POST /home/join
router.post("/join", async (req, res) => {
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

    // Find home by join code
    const home = await getHomeByJoinCode(joinCode);

    if (home.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid join code." });
    }

    // Insert or ensure membership for this user in this home
    await addUserToHome(home[0].home_id, userId, new Date().toISOString(), null);

    console.log("User joined home:", { userId, homeId: home.id });

    return res.json({ success: true, home_id: home.id });
  } catch (error) {
    console.error("Home Join Error:", error);
  }
  return res
    .status(500)
    .json({ success: false, message: "An internal server error occurred." });
});

// POST /home/create-home
router.post("/create-home", async (req, res) => {
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

    // Insert new home
    const result = await addHome(joinCode, homeName, homeAddress);
    const insertId = result.insertId;

    // Insert membership for the creator
    await addUserToHome(insertId, userId, new Date().toISOString(), null);

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
});

// GET /home/roommates - Get all roommates in user's home
router.get("/roommates", async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get user's home_id
    const userHome = await getAllHomesForUser(userId);

    if (userHome.length === 0) {
      // User not in any home yet → no roommates
      return res.json({ roommates: [] });
    }

    const homeId = userHome[0].home_id;

    // Get all users in the same home
    const roommates = await getAllUsersInHome(homeId);

    return res.json({ roommates });
  } catch (error) {
    console.error("Roommates fetch error:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
});

export default router;
