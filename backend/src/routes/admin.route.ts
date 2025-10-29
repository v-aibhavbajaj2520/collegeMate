import express from "express";
import { createMentor } from "../controllers/admin.controller.js";
import { authorize } from "../middleware/authenticate.js";

const router = express.Router();

// Route definition
router.post("/create", authorize(["ADMIN"]), createMentor);

export default router;