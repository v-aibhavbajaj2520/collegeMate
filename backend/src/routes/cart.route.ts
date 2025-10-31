import express from "express";
import { authenticateToken, authorize } from "../middleware/authenticate.js";
import {
  getAllCartItems,
  addItemToCart,
  removeItemFromCart,
  clearCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

// Get all items in user's cart
router.get("/", authenticateToken, authorize(["USER"]), getAllCartItems);

// Add item to cart (only users)
router.post("/", authenticateToken, authorize(["USER"]), addItemToCart);

// Clear all items from the cart
router.delete("/clearCart", authenticateToken, authorize(["USER"]), clearCart);

// Remove a specific item from the cart
router.delete("/:id", authenticateToken, authorize(["USER"]), removeItemFromCart);

export default router;