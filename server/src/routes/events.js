import { Router } from "express";
import { pool } from "../db/pool.js";
import jwt from "jsonwebtoken";
import { addEvent, deleteEvent, getEventByID, updateEvent } from "../db/event_sql.js";
import { inviteUserToEvent, updateEventInvite, getEventsUserIsInvitedTo, getEventsUserCreated, getUsersInvitedToEvent } from "../db/event_invite_sql.js";
import { getAllHomesForUser } from "../db/home_membership_sql.js";

const router = Router();
const TOKEN_COOKIE = "hh_token";

// GET /events/user
router.get("/user", async (req, res) => {
	const token = req.cookies?.[TOKEN_COOKIE];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userID = payload.user_id;
    try {
        const events = await getEventsUserIsInvitedTo(userID);
        const createdEvents = await getEventsUserCreated(userID);
		return res.json({ success: true, events, createdEvents });
	} catch (error) {
		console.error("Getting events for the user went wrong somehow: ", error);
		return res.status(500).json({ success: false, error: "Server error occurred." });
	}
});

// POST /events/create
router.post("/create", async (req, res) => {
	const token = req.cookies?.[TOKEN_COOKIE];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userID = payload.user_id;
	try {

		const { title, description, event_start, event_end, user_ids_to_invite } = req.body || {};

		const userHome = await getAllHomesForUser(userID);

		if (userHome.length === 0) {
			return res.status(400).json({ error: "User not part of any home" });
		}

		const homeId = userHome[0].home_id;
		const result = await addEvent(homeId, title, description || null, event_start, event_end || null, userID);
		const eventId = result.insertId;

		if (user_ids_to_invite.length > 0) {
			for (const uid of user_ids_to_invite) {
				try {
					await inviteUserToEvent(eventId, uid, "Tentative");
				} catch (err) {
					console.error("Invite failed for user, here's who and why: ", uid, err);
				}
			}
		}
		return res.json({ success: true, event_id: eventId });
	} catch (e) {
		console.error("Making the event OR inviting people went wrong: ", e);
		return res.status(500).json({ success: false, error: "Server error occurred." });
	}
});

// POST /events/update
router.post("/update", async (req, res) => {
    const token = req.cookies?.[TOKEN_COOKIE];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userID = payload.user_id;
    try {
        const { event_id, title, description, event_start, event_end } = req.body || {};
        const event = await getEventByID(event_id);
		if (event[0].created_by_user_id !== userID) {
            return res.status(403).json({ error: "You didn't make this event. Update failed." });
        }
        await updateEvent(event_id, title, description, event_start, event_end);
        return res.json({ success: true });
    } catch (e) {
        console.error("Couldn't update the event: ", e);
        return res.status(500).json({ success: false, error: "Server error occurred." });
    }
});

// POST /events/delete
router.post("/delete", async (req, res) => {
	const token = req.cookies?.[TOKEN_COOKIE];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userID = payload.user_id;
	try {
		const { event_id } = req.body || {};

		const event = await getEventByID(event_id);
        // console.log(event);
		if (event[0].created_by_user_id !== userID) {
            return res.status(403).json({ error: "You didn't make this event. Deletion failed." });
        }

		await deleteEvent(event_id);
		return res.json({ success: true });
	} catch (e) {
		console.error("Couldn't delete the event: ", e);
		return res.status(500).json({ success: false, error: "Server error occurred." });
	}
});

// POST /events/rsvp
router.post("/rsvp", async (req, res) => {
	const token = req.cookies?.[TOKEN_COOKIE];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userID = payload.user_id;
	try {
		const { event_id, rsvp_status } = req.body || {};

		// try update; if no rows affected, insert
		await updateEventInvite(event_id, userID, rsvp_status);
		return res.json({ success: true });
	} catch (e) {
		console.error("Couldn't RSVP: ", e);
		return res.status(500).json({ success: false, error: "Server error occurred." });
	}
});

// GET /events/get-rsvp-statuses
router.get("/get-rsvp-statuses", async (req, res) => {
	const { event_id } = req.query || {};
	try {
		const invites = await getUsersInvitedToEvent(event_id);
        console.log(invites);
		return res.json({ success: true, event_id, invites });
	} catch (error) {
		console.error("Getting RSVP statuses failed: ", error);
		return res.status(500).json({ success: false, error: "Server error occurred." });
	}
});

export default router;