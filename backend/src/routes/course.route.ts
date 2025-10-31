import express from "express";
import { authenticateToken, authorize } from "../middleware/authenticate.js";
import {
  getAllCourses,
  createCourse,
  deleteCourse,
} from "../controllers/course.controller.js";

const router = express.Router();

// Get all courses (Public - for dropdowns)
router.get("/", getAllCourses);

// Create a course (ADMIN only)
router.post("/", authenticateToken, authorize(["ADMIN"]), createCourse);

// Delete a course (ADMIN only)
router.delete("/:id", authenticateToken, authorize(["ADMIN"]), deleteCourse);

export default router;

