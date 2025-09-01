

import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  packageId: {
    type: String,
    required: true
  },
    images:{
    type: [String],
    required: true,
    // Example: ["image1.jpg", "image2.jpg", "image3.jpg"]
  },
  packageName: {
    type: String,
    required: true
  },
  travelDate: {
    type: Date,
    required: true
  },
  travelers: {
    type: Number,
    required: true
  },
  contactInfo: {
    phone: { type: String },
    email: { type: String }
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

export const Booking = mongoose.model("Booking", bookingSchema);
