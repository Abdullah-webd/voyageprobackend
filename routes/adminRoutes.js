import express from 'express';
import {authMiddleware} from "../middleware/auth.middleware.js";
import adminMiddleware from '../middleware/adminMiddleware.js';
import { getAllBookings } from '../controllers/bookingController.js';

const router = express.Router();


// Only admins can access this
router.get('/dashboard', authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    message: 'Welcome Admin',
    user: req.user
  });
});

router.get("/getAllBooking", authMiddleware, adminMiddleware, getAllBookings);

export default router
