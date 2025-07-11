// models/package.js

import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    // Example: "Dubai (Family Gateway)"
  },
  images:{
    type: [String],
    required: true,
    // Example: ["image1.jpg", "image2.jpg", "image3.jpg"]
  },
  tagline: {
    type: String,
    required: true,
    // Example: "7 days of sun, sea, and unforgettable memories"
  },
  duration: {
    type: String,
    required: true,
    // Example: "7 Days / 6 Nights"
  },
  pricePerAdult: {
    type: Number,
    required: true,
    // Example: 50
  },
  location: {
    country: String,
    city: String,
    // Example: country: "UAE", city: "Dubai Marina"
  },
  rating: {
    type: Number,
    default: 0,
    // Example: 5.0
  },
  totalBookings: {
    type: Number,
    default: 0,
    // Example: 520
  },
  whatsIncluded: [
    {
      type: String
    }
    // Example:
    // [
    //   "Hotel/Resort Accommodation",
    //   "Daily Meals",
    //   "Airport Pickup & Drop-off",
    //   "Guided Tours & Entry Tickets",
    //   "Family-friendly Activities"
    // ]
  ],
  itinerary: [
    {
      day: Number,
      title: String,
      description: String
    }
    // Example:
    // { day: 1, title: "Arrival & Welcome Dinner" }
  ],
  accommodation: {
    roomType: String,
    resortType: String
    // Example:
    // roomType: "Standard Suites"
    // resortType: "BeachFront Resort"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Package = mongoose.model('Package', packageSchema);
