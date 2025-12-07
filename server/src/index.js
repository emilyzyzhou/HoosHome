import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import homeRoutes from "./routes/home.js";
import profileSettingsRoutes from "./routes/profile-settings.js";

import { pool } from "./db/pool.js";
import { loginLimiter, generalLimiter } from "./middleware/rateLimiter.js";

const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());


app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);


app.use(generalLimiter);
app.use("/auth/login", loginLimiter);

app.use("/auth", authRoutes);
app.use("/profile-settings", profileSettingsRoutes);
app.use("/home", homeRoutes);


app.get("/db/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: rows[0].ok === 1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`)
);
