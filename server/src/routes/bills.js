import { Router } from "express";
import { pool } from "../db/pool.js";
import jwt from "jsonwebtoken";
import { splitBill } from "../db/bill_share_sql.js";

const router = Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  const token = req.cookies?.hh_token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.error("JWT verify failed:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// GET /bills/outstanding - Get bills where current user owes money
router.get("/outstanding", requireAuth, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const filter = req.query.filter || "outstanding";

    let query = `
      SELECT 
        b.bill_id,
        b.home_id,
        b.description,
        b.bill_type,
        b.total_amount,
        b.due_date,
        b.payer_user_id,
        b.split_rule,
        bs.amount_due as amount_owed,
        bs.status as payment_status
      FROM Bill b
      JOIN BillShare bs ON b.bill_id = bs.bill_id
      WHERE bs.user_id = ?
    `;

    if (filter === "outstanding") {
      query += " AND bs.status != 'paid'";
    }

    query += " ORDER BY b.due_date DESC";

    const [rows] = await pool.query(query, [userId]);
    res.json({ bills: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /bills/created - Get bills created by current user
router.get("/created", requireAuth, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT 
        bill_id,
        home_id,
        description,
        bill_type,
        total_amount,
        due_date,
        payer_user_id,
        split_rule
      FROM Bill
      WHERE payer_user_id = ?
      ORDER BY due_date DESC`,
      [userId]
    );

    res.json({ bills: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /bills/:billId/shares - Get all shares for a specific bill
router.get("/:billId/shares", requireAuth, async (req, res) => {
  try {
    const { billId } = req.params;
    const userId = req.user.user_id;

    const [billRows] = await pool.query(
      "SELECT payer_user_id FROM Bill WHERE bill_id = ?",
      [billId]
    );

    if (billRows.length === 0) {
      return res.status(404).json({ error: "Bill not found" });
    }

    if (billRows[0].payer_user_id !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const [shares] = await pool.query(
      `SELECT 
        bs.bill_id,
        bs.user_id,
        u.name as user_name,
        bs.amount_due,
        bs.status
      FROM BillShare bs
      JOIN Users u ON bs.user_id = u.user_id
      WHERE bs.bill_id = ?
      ORDER BY u.name`,
      [billId]
    );

    res.json({ shares });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /bills - Create a new bill
router.post("/", requireAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.user_id;
    const {
      description,
      bill_type,
      total_amount,
      due_date,
      split_rule,
      shares,
    } = req.body;

    console.log("Create bill payload:", {
      userId,
      description,
      bill_type,
      total_amount,
      due_date,
      split_rule,
      shares,
    });

    if (
      !description ||
      !total_amount ||
      !due_date ||
      !Array.isArray(shares) ||
      shares.length === 0
    ) {
      conn.release();
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the user's home
    const [userHome] = await conn.query(
      "SELECT home_id FROM HomeMembership WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (userHome.length === 0) {
      conn.release();
      return res.status(400).json({ error: "User not part of any home" });
    }

    // Validate share amounts
    for (const share of shares) {
      if (split_rule === "custom" && (!share.amount_due || share.amount_due <= 0)) {
        conn.release();
        return res.status(400).json({ 
          error: "All roommate shares must be greater than $0.00. Please adjust the split amounts." 
        });
      }
    }

    const homeId = userHome[0].home_id;

    await conn.beginTransaction();

    // Insert the bill
    const [billResult] = await conn.query(
      `
      INSERT INTO Bill
        (home_id, description, bill_type, total_amount, due_date, payer_user_id, split_rule)
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
      `,
      [homeId, description, bill_type || null, total_amount, due_date, userId, split_rule]
    );

    const billId = billResult.insertId;
    console.log("Created bill with id:", billId);

    // need to commit here to use the stored procedure
    await conn.commit();

    // if its equal use the stored procedure - if not just slam em in
    if (split_rule === "equal") {
      // stored procedure prayge
      await splitBill(billId);
      console.log("Called split_bill stored procedure for bill", billId);
    } else {
      // Insert shares ONE BY ONE (simple + reliable)
      for (const share of shares) {
        console.log("Inserting custom share row:", {
          bill_id: billId,
          user_id: share.user_id,
          amount_due: share.amount_due,
          status: share.status || "unpaid",
        });

        await conn.query(
          `
          INSERT INTO BillShare (bill_id, user_id, amount_due, status)
          VALUES (?, ?, ?, ?)
          `,
          [billId, share.user_id, share.amount_due, share.status || "unpaid"]
        );
      }
    }

    await conn.commit();
    conn.release();

    return res.json({ success: true, bill_id: billId });
  } catch (e) {
    console.error("Create bill error:", e);
    try {
      await conn.rollback();
      conn.release();
    } catch (_) {
      // ignore rollback errors
    }
    return res.status(500).json({ error: "Server error" });
  }
});


// PUT /bills/:billId - Update a bill
router.put("/:billId", requireAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { billId } = req.params;
    const userId = req.user.user_id;
    const { description, bill_type, total_amount, due_date, split_rule, shares } = req.body;

    console.log("Update bill payload:", {
      billId,
      userId,
      description,
      bill_type,
      total_amount,
      due_date,
      split_rule,
      shares,
    });

    const [billRows] = await conn.query(
      "SELECT payer_user_id FROM Bill WHERE bill_id = ?",
      [billId]
    );

    if (billRows.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Bill not found" });
    }

    if (billRows[0].payer_user_id !== userId) {
      conn.release();
      return res.status(403).json({ error: "Not authorized" });
    }

    await conn.beginTransaction();

    await conn.query(
      `UPDATE Bill 
       SET description = ?, bill_type = ?, total_amount = ?, due_date = ?, split_rule = ?
       WHERE bill_id = ?`,
      [description, bill_type || null, total_amount, due_date, split_rule, billId]
    );

    // if shares provided, replace them entirely
    if (Array.isArray(shares) && shares.length > 0) {
      await conn.query("DELETE FROM BillShare WHERE bill_id = ?", [billId]);

      if (split_rule === "equal") {
        // Use stored procedure for equal split
        await conn.query("CALL split_bill(?)", [billId]);
        console.log("Called split_bill stored procedure for updated bill", billId);
      } else {
        // Validate share amounts
        for (const share of shares) {
          if (!share.amount_due || share.amount_due <= 0) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({ 
              error: "All roommate shares must be greater than $0.00. Please adjust the split amounts." 
            });
          }
        }

      await conn.query("DELETE FROM BillShare WHERE bill_id = ?", [billId]);

        const shareValues = shares.map((s) => [
          billId,
          s.user_id,
          s.amount_due,
          s.status || "unpaid",
        ]);

        await conn.query(
          "INSERT INTO BillShare (bill_id, user_id, amount_due, status) VALUES ?",
          [shareValues]
        );
      }
    }

    await conn.commit();
    conn.release();

    return res.json({ success: true });
  } catch (e) {
    console.error("Update bill error:", e);
    try {
      await conn.rollback();
      conn.release();
    } catch (_) {}
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /bills/:billId - Delete a bill
router.delete("/:billId", requireAuth, async (req, res) => {
  try {
    const { billId } = req.params;
    const userId = req.user.user_id;

    const [billRows] = await pool.query(
      "SELECT payer_user_id FROM Bill WHERE bill_id = ?",
      [billId]
    );

    if (billRows.length === 0) {
      return res.status(404).json({ error: "Bill not found" });
    }

    if (billRows[0].payer_user_id !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Delete bill shares first, then delete the bill
    await pool.query("DELETE FROM BillShare WHERE bill_id = ?", [billId]);
    await pool.query("DELETE FROM Bill WHERE bill_id = ?", [billId]);

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
