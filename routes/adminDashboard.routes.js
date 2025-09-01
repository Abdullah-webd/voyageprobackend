import express from "express";
import {
  getTotalUsers,
  getTotalBookings,
  getTopBookings,
  getTotalRevenue,
  getRecentBookings
} from "../controllers/adminDashboard.controller.js";
import adminMiddleware from '../middleware/adminMiddleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminChangeBookingStatus } from "../controllers/bookingController.js";


const router = express.Router();

router.get("/users", authMiddleware,adminMiddleware, getTotalUsers);
router.get("/bookings",  authMiddleware,adminMiddleware, getTotalBookings);
router.get("/top-bookings", authMiddleware,adminMiddleware, getTopBookings);
router.get("/revenue",  authMiddleware,adminMiddleware, getTotalRevenue);
router.get("/recent-bookings", authMiddleware,adminMiddleware, getRecentBookings);
router.patch("/admin/:id/status", authMiddleware, adminMiddleware, adminChangeBookingStatus);
export default router;