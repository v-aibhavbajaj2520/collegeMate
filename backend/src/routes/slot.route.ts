import express from "express";
import { authenticateToken, authorize } from "../middleware/authenticate.js";
import {
  openSlot,
  closeSlot,
  getAllSlotsOfMentor,
  getMentorAvailableSlots,
} from "../controllers/slot.controller.js";

const router = express.Router();

/**
 * @route   POST /api/slots/open
 * @desc    Open a new slot (mentor only)
 * @access  Private (Mentor)
 * @body    { date: "YYYY-MM-DD", startTime: "HH:MM" }
 */
router.post(
  "/open",
  authenticateToken,
  authorize(["MENTOR"]),
  openSlot
);

/**
 * @route   DELETE /api/slots/close/:slotId
 * @desc    Close an existing slot (mentor only, must be their own slot)
 * @access  Private (Mentor)
 * @param   slotId - The ID of the slot to close
 */
router.delete(
  "/close/:slotId",
  authenticateToken,
  authorize(["MENTOR"]),
  closeSlot
);

/**
 * @route   GET /api/slots/my-slots
 * @desc    Get all slots for the authenticated mentor
 * @access  Private (Mentor)
 * @query   status? - Filter by status (CLOSED, AVAILABLE, BOOKED)
 * @query   date? - Filter by exact date (YYYY-MM-DD)
 * @query   startDate? - Filter by start date range (YYYY-MM-DD)
 * @query   endDate? - Filter by end date range (YYYY-MM-DD)
 */
router.get(
  "/my-slots",
  authenticateToken,
  authorize(["MENTOR"]),
  getAllSlotsOfMentor
);

/**
 * @route   GET /api/slots/mentor/:mentorId
 * @desc    Get all available slots for a specific mentor (for students to view)
 * @access  Public
 * @param   mentorId - The ID of the mentor
 * @query   date? - Filter by exact date (YYYY-MM-DD)
 * @query   startDate? - Filter by start date range (YYYY-MM-DD)
 * @query   endDate? - Filter by end date range (YYYY-MM-DD)
 */
router.get(
  "/mentor/:mentorId",
  getMentorAvailableSlots
);

export default router;