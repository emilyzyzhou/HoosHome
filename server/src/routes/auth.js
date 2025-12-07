import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { loginLimiter } from "../middleware/rateLimiter.js";
import { getUserByEmail, addUser } from "../db/user_sql.js";

const router = Router();
const TOKEN_COOKIE = "hh_token";
const JWT_EXPIRES = "7d"; // adjust

// Helper to set cookie
function setAuthCookie(res, payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: true, // process.env.NODE_ENV === "production", // true in prod (HTTPS)
    sameSite: "none", // changed from lax
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

// function setAuthCookie(res, payload) { // previous block changed to this for fixing cookie settings
//   const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });

//   const isProd = process.env.NODE_ENV === "production";

//   res.cookie(TOKEN_COOKIE, token, {
//     httpOnly: true,
//     secure: true,
//     sameSite: "none",
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//     path: "/",
//   });
// }

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone_number, billing_info, profile_link } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Check if email exists
    const rows = await getUserByEmail(email);
    if (rows.length) return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 12);

    // Insert — include all columns you require; use NULL for optional fields
    const result = await addUser(name, email, hash, phone_number, billing_info, profile_link);

    setAuthCookie(res, { user_id: result.insertId, email });
    res.json({ ok: true, user_id: result.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});


// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const rows = await getUserByEmail(email);
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

  const user = rows[0];
  // schema stores the bcrypt hash in the `password` column
  const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    setAuthCookie(res, { user_id: user.user_id, email: user.email });
    res.json({ ok: true, user_id: user.user_id, name: user.name });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /auth/me (optional)
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.[TOKEN_COOKIE];
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ ok: true, user: payload });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// POST /auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie(TOKEN_COOKIE, { path: "/" });
  res.json({ ok: true });
});

export default router;
