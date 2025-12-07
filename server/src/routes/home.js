import { Router } from "express";
import { pool } from "../db/pool.js";
import { getBillsForUser } from "../db/bill_share_sql.js";
import { getAllHomesForUser, getAllUsersInHome } from "../db/home_membership_sql.js";
import { getEventsByHomeID } from "../db/event_sql.js";
import { getChoresForHome } from "../db/chore_assignment_sql.js";
import { getLeaseByHomeID } from "../db/lease_sql.js";
import jwt from "jsonwebtoken";

const router = Router();
const TOKEN_COOKIE = "hh_token";

// POST /home/join
router.post("/join", async (req, res) => {
  try {
    const { joinCode } = req.body || {};

    if (!joinCode) {
      return res.status(400).json({ success: false, message: "Join code is required." });
    }

    const [rows] = await pool.query(
      'SELECT * FROM Homes WHERE join_code = ?',
      [joinCode]
    );

    const homes = rows; 

    if (homes.length > 0) {
      const home = homes[0];
      console.log("Found home:", home);
      return res.json({ success: true, home_id: home.id });
    } else {
      return res.status(404).json({ success: false, message: "Invalid join code." });
    }

  } catch (error) {
    console.error("Home Join Error:", error);
    return res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// POST /home/create-home
router.post("/create-home", async (req, res) => {
  try {
    const { homeName, homeAddress } = req.body || {};

    // validation
    if (!homeName || !homeAddress) {
      return res.status(400).json({ success: false, message: "Home name and address are required." });
    }

    // random number generator
    const joinCode = Math.floor(100000 + Math.random() * 900000).toString();

    // inserting into database
    const [result] = await pool.query(
      'INSERT INTO Homes (name, address, join_code) VALUES (?, ?, ?)',
      [homeName, homeAddress, joinCode]
    );
    
    const insertId = result.insertId;
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
        }
      });
    } else {
      throw new Error("No rows were affected. Insert failed.");
    }

  } catch (error) {
    console.error("Home Create Error:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(500).json(
        { success: false, message: "A duplicate join code was generated. Please try again." }
      );
    }

    return res.status(500).json(
      { success: false, message: "An internal server error occurred." }
    );
  }
});

// GET /home/dashboard
router.get("/dashboard", async (req, res) => {
  try {

    const token = req.cookies?.[TOKEN_COOKIE];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userID = payload.user_id; 
    const homeId = [await getAllHomesForUser(userID)].home_id;

    const roommates = await getAllUsersInHome(homeId);
    const bills = await getBillsForUser(userID);
    const events = await getEventsByHomeID(homeId);
    const chores = await getChoresForHome(homeId);
    const lease = await getLeaseByHomeID(homeId);

    return res.json({
      roommates,
      bills,
      events,
      chores,
      lease,
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;