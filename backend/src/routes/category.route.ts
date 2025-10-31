import express from "express";
import {
  createCategory,
  getAllCategories,
  getOneCategory,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";
import { authenticateToken, authorize } from "../middleware/authenticate.js";

const router = express.Router();

// Create category
router.post("/", authenticateToken, authorize(["ADMIN"]), createCategory);

// Get all categories without mentors
router.get("/", authenticateToken, authorize(["ADMIN"]), getAllCategories);

// Get one specific category with mentors in it
router.get("/:id", authenticateToken, authorize(["ADMIN"]), getOneCategory);

// Update a category with one specific id
router.put("/:id", authenticateToken, authorize(["ADMIN"]), updateCategory);

// Delete a specific category with id
router.delete("/:id", authenticateToken, authorize(["ADMIN"]), deleteCategory);

export default router;