import express from "express";
import { authenticateToken, authorize } from "../middleware/authenticate.js";
import {
  bookFromCart,
  getAllBookings,
  getMentorBookings,
  getAllUserBooking,
  cancelABooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

// USER: Book from cart
router.post(
  "/book-from-cart",
  authenticateToken,
  authorize(["USER"]),
  bookFromCart
);

// ADMIN: Get all bookings
router.get(
  "/all",
  authenticateToken,
  authorize(["ADMIN"]),
  getAllBookings
);

// MENTOR: Get mentor's bookings
router.get(
  "/mentor",
  authenticateToken,
  authorize(["MENTOR"]),
  getMentorBookings
);

// USER: Get user's bookings
router.get(
  "/user",
  authenticateToken,
  authorize(["USER"]),
  getAllUserBooking
);

// USER & MENTOR: Cancel a booking
router.patch(
  "/:bookingId/cancel",
  authenticateToken,
  authorize(["USER", "MENTOR"]),
  cancelABooking
);

export default router;