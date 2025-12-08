import { Router } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { getLeaseByHomeID, updateLease } from "../db/lease_sql.js";
import { getAllHomesForUser } from "../db/home_membership_sql.js";

const router = Router();
const TOKEN_COOKIE = "hh_token";

function getUserId(req) {
  const token = req.cookies?.[TOKEN_COOKIE];
  if (!token) return null;
  return jwt.verify(token, process.env.JWT_SECRET).user_id;
}

// GET /lease
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const homes = await getAllHomesForUser(userId);
    if (homes.length === 0) return res.json({ lease: null });

    const homeId = homes[0].home_id;

    const leaseRows = await getLeaseByHomeID(homeId);
    if (leaseRows.length === 0) return res.json({ lease: null });

    const l = leaseRows[0];

    const [landlord] = await pool.query(
      "SELECT name FROM Users WHERE user_id = ?",
      [l.landlord_id]
    );

    const landlord_name = landlord.length ? landlord[0].name : "Unknown";

    const lease = {
      lease_id: l.lease_id,
      home_id: l.home_id,
      landlord_id: l.landlord_id,
      landlord_name,
      start_date: l.start_date.toISOString().split("T")[0],
      end_date: l.end_date.toISOString().split("T")[0],
      rent_amount: l.monthly_rent,
      monthly_rent: l.monthly_rent,
      lease_file_url: l.lease_file_url || null
    };

    return res.json({ lease });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load lease" });
  }
});

router.put("/update", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const homes = await getAllHomesForUser(userId);
    if (homes.length === 0) return res.status(400).json({ error: "No home" });

    const homeId = homes[0].home_id;

    const rows = await getLeaseByHomeID(homeId);
    if (!rows.length) return res.status(400).json({ error: "No lease exists" });

    const lease = rows[0];

    const { start_date, end_date, rent_amount } = req.body;

    await updateLease(
      lease.lease_id,
      homeId,
      start_date,
      end_date,
      rent_amount,
      lease.landlord_id
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update lease" });
  }
});

export default router;
