// mentor.route.ts
import express from "express";
import { authenticateToken, authorize } from "../middleware/authenticate.js";
import { 
  getAllMentors, 
  getMentorById, 
  createMentor, 
  updateMentor, 
  deleteMentor 
} from "../controllers/mentor.controller.js";

const router = express.Router();

// Get all mentors (ADMIN only)
router.get("/", authenticateToken, authorize(["ADMIN"]), getAllMentors);

// Get a specific mentor by ID (ADMIN only)
router.get("/:id", authenticateToken, authorize(["ADMIN"]), getMentorById);

// Create a mentor with email, password, and category attached to it (ADMIN only)
router.post("/", authenticateToken, authorize(["ADMIN"]), createMentor);

// Update a specific mentor (ADMIN only)
router.put("/:id", authenticateToken, authorize(["ADMIN"]), updateMentor);

// Delete a mentor with a specific ID (ADMIN only)
router.delete("/:id", authenticateToken, authorize(["ADMIN"]), deleteMentor);

export default router;