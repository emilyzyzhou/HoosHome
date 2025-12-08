import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

// GET /lease/:homeId
router.get("/:homeId", async (req, res) => {
  try {
    const { homeId } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        L.lease_id, L.home_id, L.start_date, L.end_date, L.monthly_rent,
        LD.landlord_id, LD.landlord_name, LD.landlord_contact
       FROM Lease L
       JOIN Landlord LD ON L.landlord_id = LD.landlord_id
       WHERE L.home_id = ?
       LIMIT 1`,
      [homeId]
    );

    if (rows.length === 0) {
      return res.json({ success: true, lease: null });
    }

    res.json({ success: true, lease: rows[0] });
  } catch (e) {
    console.error("GET Lease Error:", e);
    res.status(500).json({ success: false, message: "Server error fetching lease." });
  }
});

// POST /lease/:homeId 
router.post("/:homeId", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { homeId } = req.params;
    const { 
      start_date, 
      end_date, 
      monthly_rent, 
      landlord_name, 
      landlord_contact 
    } = req.body;

    if (!homeId || !monthly_rent || !landlord_name || !landlord_contact) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const [existingLandlord] = await connection.query(
      "SELECT landlord_id FROM Landlord WHERE landlord_contact = ?",
      [landlord_contact]
    );

    let landlordId;

    if (existingLandlord.length > 0) {
      landlordId = existingLandlord[0].landlord_id;
      await connection.query(
        "UPDATE Landlord SET landlord_name = ? WHERE landlord_id = ?",
        [landlord_name, landlordId]
      );
    } else {
      const [newLandlord] = await connection.query(
        "INSERT INTO Landlord (landlord_name, landlord_contact) VALUES (?, ?)",
        [landlord_name, landlord_contact]
      );
      landlordId = newLandlord.insertId;
    }

    // check if a lease exists for this home
    const [existingLease] = await connection.query(
      "SELECT lease_id FROM Lease WHERE home_id = ?",
      [homeId]
    );

    if (existingLease.length > 0) {
        // Update existing lease
        await connection.query(
            `UPDATE Lease 
             SET start_date = ?, end_date = ?, monthly_rent = ?, landlord_id = ?
             WHERE home_id = ?`,
            [start_date, end_date, monthly_rent, landlordId, homeId]
        );
    } else {
        // Create new lease
        await connection.query(
            `INSERT INTO Lease (home_id, start_date, end_date, monthly_rent, landlord_id)
             VALUES (?, ?, ?, ?, ?)`,
            [homeId, start_date, end_date, monthly_rent, landlordId]
        );
    }

    await connection.commit();
    res.json({ success: true, message: "Lease details saved successfully." });

  } catch (e) {
    await connection.rollback();
    console.error("POST Lease Error:", e);
    res.status(500).json({ success: false, message: "Server error saving lease." });
  } finally {
    connection.release();
  }
});

export default router;