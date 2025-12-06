import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

// GET /chore/:homeId
router.get("/:homeId", async (req, res) => {
  try {
    const { homeId } = req.params;

    if (!homeId) {
      return res.status(400).json({ error: "Home ID is required." });
    }

    const [rows] = await pool.query(
      'SELECT chore_id, home_id, title, description, due_date, recurrence FROM Chore WHERE home_id = ?',
      [homeId]
    );

    res.json({ success: true, chores: rows });
  } catch (e) {
    console.error("GET Chores Error:", e);
    res.status(500).json({ error: "Server error retrieving chores." });
  }
});

// POST /chore/:homeId
router.post("/:homeId", async (req, res) => {
  try {
    const { homeId } = req.params;
    const { title } = req.body;

    if (!homeId || !title) {
      return res.status(400).json({ error: "Home ID and chore title are required." });
    }

    const [result] = await pool.query(
      'INSERT INTO Chore (home_id, title, due_date, recurrence) VALUES (?, ?, "2025-10-28", "Weekly")',
      [homeId, title]
    );
    res.status(201).json({ 
      success: true, 
      chore: {
        chore_id: result.insertId,
        title: title,
        home_id: homeId,
      }
    });
  } catch (e) {
    console.error("POST Chore Error:", e);
    res.status(500).json({ error: "Server error creating chore." });
  }
});

// DELETE /chore/:choreId
router.delete("/:choreId", async (req, res) => {
  try {
    const { choreId } = req.params;

    if (!choreId) {
      return res.status(400).json({ error: "Chore ID is required." });
    }

    const [result] = await pool.query(
      'DELETE FROM Chore WHERE chore_id = ?',
      [choreId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Chore not found." });
    }

    res.json({ success: true, message: "Chore deleted." });
  } catch (e) {
    console.error("DELETE Chore Error:", e);
    res.status(500).json({ error: "Server error deleting chore." });
  }
});

export default router;