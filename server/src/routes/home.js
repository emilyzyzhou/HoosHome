import { Router } from "express";
import { pool } from "../db/pool.js";
import { getBillsForUser } from "../db/bill_share_sql.js";
import { getBillByHome } from "../db/bill_sql.js";
import {
  getAllHomesForUser,
  getAllUsersInHome,
  addUserToHome
} from "../db/home_membership_sql.js";
import { getEventsByHomeID } from "../db/event_sql.js";
import { getChoresForHome } from "../db/chore_assignment_sql.js";
import { getLeaseByHomeID } from "../db/lease_sql.js";
import jwt from "jsonwebtoken";
import { getHomeByJoinCode, addHome } from "../db/home_sql.js";

function getUserIdFromRequest(req) {
  const token = req.cookies?.hh_token;
  if (!token) return null;
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  return payload.user_id;
}

const router = Router();
const TOKEN_COOKIE = "hh_token";

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
    const today = new Date().toISOString().split('T')[0];

    // Insert or ensure membership for this user in this home
    await addUserToHome(home[0].home_id, userId, today, null);

    console.log("User joined home:", { userId, homeId: home[0].home_id });

    return res.json({ success: true, home_id: home[0].home_id });
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
    const today = new Date().toISOString().split('T')[0];

    // Insert membership for the creator
    await addUserToHome(insertId, userId, today, null);

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
    const token = req.cookies?.[TOKEN_COOKIE];
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userID = payload.user_id;

    const homes = await getAllHomesForUser(userID);

    if (homes.length === 0) {
      return res.json({
        roommates: [],
        bills: [],
        events: [],
        chores: [],
        lease: null,
      });
    }

    const homeId = homes[0].home_id;
    const joinCode = homes[0].join_code;

    const [roommates, events, leaseArray] = await Promise.all([
      getAllUsersInHome(homeId),
      getEventsByHomeID(homeId),
      getLeaseByHomeID(homeId),
    ]);


    // Normalize and filter upcoming events (start date today or later), then sort by start date

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      // Filter events where user is invited or is creator
      const [userEventInvites] = await pool.query(
        "SELECT event_id FROM EventInvite WHERE user_id = ?",
        [userID]
      );
      
      const userEventIds = new Set(userEventInvites.map(ei => ei.event_id));
      const userEvents = events.filter(e => 
        userEventIds.has(e.event_id) || e.created_by_user_id === userID
      );

      const upcoming = [];
      const past = [];

      for (const e of userEvents) {
        const start = new Date(e.event_start);
        const end = e.event_end ? new Date(e.event_end) : null;

        // Determine if the event is over
        const eventIsOver = end ? end < now : start < now;

        if (!eventIsOver) {
          // Still active or upcoming
          upcoming.push(e);
        } else {
          // Event is in the past — but hide if older than ~7 days
          // Use the *end* date if available, else fall back to start date
          const comparisonDate = end || start;

          if (comparisonDate >= sevenDaysAgo) {
            past.push(e);
          }
        }
      }

      // Sort sections by start date
      upcoming.sort((a, b) => new Date(a.event_start) - new Date(b.event_start));
      past.sort((a, b) => new Date(b.event_start) - new Date(a.event_start)); // newest past first

      // Normalize to frontend shape
      function normalizeEvent(e) {
        return {
          event_id: e.event_id,
          title: e.title,
          description: e.description,
          start_date: e.event_start ? new Date(e.event_start).toISOString().split("T")[0] : null,
          end_date: e.event_end ? new Date(e.event_end).toISOString().split("T")[0] : null,
          created_by_user_id: e.created_by_user_id,
        };
      }

    const upcomingEvents = upcoming.map(normalizeEvent);
    const pastEvents = past.map(normalizeEvent);

    // Normalize lease info if available
    let lease = null;
    if (leaseArray.length > 0) {
      const l = leaseArray[0];

      const [landlordRows] = await pool.query(
        "SELECT name FROM Users WHERE user_id = ?",
        [l.landlord_id]
      );

      const landlordName = landlordRows.length > 0 ? landlordRows[0].name : "Unknown";

      lease = {
        landlord_name: landlordName,
        start_date: l.start_date.toISOString().split("T")[0],
        end_date: l.end_date.toISOString().split("T")[0],
        rent_amount: l.monthly_rent,
      };
    }

    // Normalize chore data - only chores assigned to this user
    const chores = [];

    const [rawChores] = await pool.query(
      `SELECT ca.chore_id, ca.user_id, ca.status 
       FROM ChoreAssignment ca 
       WHERE ca.user_id = ?`,
      [userID]
    );

    if (rawChores.length > 0) {
      for (const c of rawChores) {
        const [choreFullRows] = await pool.query(
          "SELECT title, description, due_date, recurrence FROM Chore WHERE chore_id = ?",
          [c.chore_id]
        );

        const full = choreFullRows[0];

        // User is already the assignee since we filtered by user_id
        const [userRows] = await pool.query(
          "SELECT name FROM Users WHERE user_id = ?",
          [c.user_id]
        );
        const assigneeName = userRows.length > 0 ? userRows[0].name : null;

        chores.push({
          chore_id: c.chore_id,
          title: full?.title || "Untitled",
          description: full?.description || "",
          due_date: full?.due_date ? full.due_date.toISOString().split("T")[0] : null,
          recurrence: full?.recurrence || null,
          assignee: assigneeName,
          status: c.status || "Not Set",
        });
      }
    }

    // Get bills where user has a share (BillShare entry)
    const [userBillShares] = await pool.query(
      `SELECT bs.bill_id, bs.amount_due, bs.status, b.description, b.bill_type, 
              b.total_amount, b.due_date, b.payer_user_id
       FROM BillShare bs
       JOIN Bill b ON bs.bill_id = b.bill_id
       WHERE bs.user_id = ? AND b.home_id = ?`,
      [userID, homeId]
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingBillShares = userBillShares.filter(b => new Date(b.due_date) >= today);

    const bills = upcomingBillShares.map(b => ({
      bill_id: b.bill_id,
      description: b.description,
      bill_type: b.bill_type,
      total_amount: b.total_amount,
      due_date: b.due_date.toISOString().split("T")[0],
      payer_user_id: b.payer_user_id,
      user_amount_due: b.amount_due,
      user_payment_status: b.status,
    }));

  return res.json({
    home_id: homeId,
    join_code: joinCode,
    roommates,
    bills,
    events: {
      upcoming: upcomingEvents,
      past: pastEvents,
    },
    chores,
    lease,
  });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /home/users/:homeId - Get all users in a specific home
router.get("/users/:homeId", async (req, res) => {
  try {
    const homeId = parseInt(req.params.homeId, 10);
    
    if (isNaN(homeId)) {
      return res.status(400).json({ success: false, message: "Invalid home ID" });
    }

    const users = await getAllUsersInHome(homeId);
    
    return res.json({ 
      success: true, 
      users: users.map(u => ({
        user_id: u.user_id,
        name: u.name,
        email: u.email
      }))
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});


export default router;
