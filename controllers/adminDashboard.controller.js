import User from "../models/user.js";
import {Booking} from "../models/booking.js";
import Payments from "../models/Payment.model.js";

// Get total users (excluding admins)
export const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    res.json({ totalUsers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch total users" });
  }
};

// Get total bookings
export const getTotalBookings = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    res.json({ totalBookings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch total bookings" });
  }
};

// Get top booked travel packages
export const getTopBookings = async (req, res) => {
  try {
    const topPackages = await Payments.aggregate([
      { $group: { _id: "$packageId", packageName: { $first: "$packageName" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    res.json({ topPackages });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top bookings" });
  }
};

// Get total revenue
export const getTotalRevenue = async (req, res) => {
  try {
    const result = await Payments.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmountPaid" } } }
    ]);
    const totalRevenue = result[0]?.totalRevenue || 0;
    res.json({ totalRevenue });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch total revenue" });
  }
};

// Get recent bookings
export const getRecentBookings = async (req, res) => {
  try {
    const recentBookings = await Payments.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ recentBookings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent bookings" });
  }
};