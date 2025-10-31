import express from "express";
import { authenticateToken, authorize } from "../middleware/authenticate.js";
import {
  getAllColleges,
  createCollege,
  deleteCollege,
} from "../controllers/college.controller.js";

const router = express.Router();

// Get all colleges (Public - for dropdowns)
router.get("/", getAllColleges);

// Create a college (ADMIN only)
router.post("/", authenticateToken, authorize(["ADMIN"]), createCollege);

// Delete a college (ADMIN only)
router.delete("/:id", authenticateToken, authorize(["ADMIN"]), deleteCollege);

export default router;

