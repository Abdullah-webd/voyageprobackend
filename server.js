import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import connectDB from './config/database.js';

import packageRoutes from './routes/package.route.js';
import paymentRoutes from "./routes/payment.route.js";
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8008;

// ✅ Middleware
app.use(express.json());

// ✅ Connect to DB
connectDB();

// ✅ Enable CORS
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://your-frontend-url.com'] // ✅ Replace with your frontend hosted domain
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ API Routes
app.use('/api/packages', packageRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Root
app.get("/", (req, res) => {
  res.send("🌍 Welcome to Voyage Travel API (hosted on Railway)");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
