import express from "express";
const router = express.Router();
import {authMiddleware} from "../middleware/auth.middleware.js";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
} from "../controllers/bookingController.js";

// User routes
router.post("/",  createBooking); // Book a trip
router.get("/me", authMiddleware, getMyBookings); // View my bookings
router.delete("/:id", authMiddleware, cancelBooking); // Cancel booking


export default router