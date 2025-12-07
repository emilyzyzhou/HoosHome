import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();
// POST /chore/assignment
router.post("/assignment", async (req, res) => {
  console.log("POST /chore/assignment received body:", req.body);
  try {
    const { chore_id, user_id, status = 'Pending' } = req.body; 

    if (!chore_id || !user_id) {
      return res.status(400).json({ success: false, message: "Chore ID and User ID are required for assignment." });
    }

    const [result] = await pool.query(
        "INSERT INTO ChoreAssignment (chore_id, user_id, status) VALUES (?, ?, ?)",
        [chore_id, user_id, status]
    );

    res.status(201).json({ 
      success: true, 
      message: "Chore assigned successfully.",
      assignmentId: result.insertId 
    });
  } catch (e) {
    console.error("POST Assign Chore Error:", e);
    if (e.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: "This chore is already assigned." });
    }
    res.status(500).json({ success: false, message: "Server error assigning chore." });
  }
});

// PUT /chore/assignment/status
router.put("/assignment/status", async (req, res) => {
  try {
    const { chore_id, user_id, status } = req.body; 

    if (!chore_id || !user_id || !status) {
      return res.status(400).json({ success: false, message: "Chore ID, User ID, and new status are required." });
    }

    const [result] = await pool.query(
        "UPDATE ChoreAssignment SET status = ? WHERE chore_id = ? AND user_id = ?",
        [status, chore_id, user_id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Assignment not found or status is the same." });
    }

    res.json({ success: true, message: "Assignment status updated." });
  } catch (e) {
    console.error("PUT Update Status Error:", e);
    res.status(500).json({ success: false, message: "Server error updating status." });
  }
});

// DELETE /chore/assignment
router.delete("/assignment", async (req, res) => {
  try {
    const { chore_id, user_id } = req.body; 

    if (!chore_id || !user_id) {
      return res.status(400).json({ success: false, message: "Chore ID and User ID are required for removal." });
    }

    const [result] = await pool.query(
        "DELETE FROM ChoreAssignment WHERE chore_id = ? AND user_id = ?",
        [chore_id, user_id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Assignment not found." });
    }

    res.json({ success: true, message: "Chore assignment removed." });
  } catch (e) {
    console.error("DELETE Assignment Error:", e);
    res.status(500).json({ success: false, message: "Server error removing assignment." });
  }
});

// GET /chore/:homeId
router.get("/:homeId", async (req, res) => {
  try {
    const { homeId } = req.params;

    if (!homeId) {
      return res.status(400).json({ error: "Home ID is required." });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        C.chore_id, C.home_id, C.title, C.description, C.due_date, C.recurrence,
        CA.user_id,             
        CA.status  
      FROM Chore C
      LEFT JOIN ChoreAssignment CA ON C.chore_id = CA.chore_id
      WHERE C.home_id = ?
      `,
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
        description: null,
        due_date: "2025-10-28",
        recurrence: "Weekly",
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

// PUT /chore/:choreId
router.put("/:choreId", async (req, res) => {
  try {
    const { choreId } = req.params;
    const { title, description, due_date, recurrence } = req.body;

    if (!choreId) {
      return res.status(400).json({ success: false, message: "Chore ID is required for update." });
    }

    const [result] = await pool.query(
      `
      UPDATE Chore 
      SET 
        title = ?, 
        description = ?, 
        due_date = ?, 
        recurrence = ? 
      WHERE chore_id = ?
      `,
      [title, description, due_date, recurrence, choreId]
    );

    if (result.affectedRows === 0) {
      const [check] = await pool.query('SELECT chore_id FROM Chore WHERE chore_id = ?', [choreId]);
      if (check.length === 0) {
        return res.status(404).json({ success: false, message: "Chore not found." });
      }
    }
    res.json({ success: true, message: "Chore updated successfully." });
  } catch (e) {
    console.error("PUT Chore Error:", e);
    res.status(500).json({ success: false, message: "Server error updating chore." });
  }
});

export default router;