import { Router } from "express";
import jwt from "jsonwebtoken";
import { getUserByID, updateUser } from "../db/user_sql.js"
import bcrypt from "bcrypt";

const router = Router();

const TOKEN_COOKIE = "hh_token";

// GET /profile-settings/get-info
router.get("/get-info", async (req, res) => {
  const token = req.cookies?.[TOKEN_COOKIE];
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const userID = payload.user_id; 
  console.log(payload);
  try {
    const [user] = await getUserByID(userID)
    return res.json({ 
      success: true,
      user_info: {
        name: user.name, 
        email: user.email, 
        phone_number: user.phone_number, 
        bill_info: user.billing_info, 
        prof_link: user.profile_link
      }
    });
  } catch (error) {
    console.error("Getting user failed, somehow: ", error);
    return res.status(500).json({ success: false, message: "Server error occurred." });
  }
});

// note that THIS DOESN'T HANDLE PASSWORD OR pfp link (if we do that) because I think those should be separate
router.post("/update-info", async (req, res) => {
  const token = req.cookies?.[TOKEN_COOKIE];
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const userID = payload.user_id;

  const { name, email, phoneNumber, billingInfo } = req.body || {};
  try {
    // need to grab the hash & pfp link first to feed those back in since this func doesn't deal with those
    const [user] = await getUserByID(userID);
    await updateUser(userID, name, email, user.password, phoneNumber, billingInfo, user.profile_link);
    return res.json({ success: true, message: "User info updated successfully." });
  } catch (error) {
    console.error("Updating user failed, somehow: ", error);
    return res.status(500).json({ success: false, message: "Server error occurred." });
  }
});

router.post("/update-password", async (req, res) => {
  const token = req.cookies?.[TOKEN_COOKIE];
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const userID = payload.user_id;

  const { currentPassword, newPassword } = req.body || {};
  try {
    const [user] = await getUserByID(userID);
    const ok = await bcrypt.compare(currentPassword, user.password);
    const hash = await bcrypt.hash(newPassword, 12); 
    if (!ok) return res.status(401).json({ error: "Invalid current password." });
    else await updateUser(userID, user.name, user.email, hash, user.phone_number, user.billing_info, user.profile_link);
    return res.json({ success: true, message: "User password updated successfully." });
  } catch (error) {
    console.error("Updating password failed, somehow: ", error);
    return res.status(500).json({ success: false, message: "Server error occurred." });
  }
});

export default router;