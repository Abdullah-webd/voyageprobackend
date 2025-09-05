import {Booking} from "../models/booking.js";
import { Package } from '../models/package.model.js';
// Create new booking
export const createBooking = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    console.log("BODY:", req.body);

    const { packageId, travelDate, travelers, contactInfo,packageName} = req.body;


    const booking = new Booking({
      userId: req.user?._id || req.user?.id,
      packageId,
      packageName,
      travelDate: new Date(travelDate),
      travelers: Number(travelers),
      contactInfo,
      status: "pending",
    });

    console.log("Booking to be saved:", booking);

    await booking.save();

    res.status(201).json({ message: "Booking created", booking });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({ error: "Failed to create booking", details: error.message });
  }
};

export const adminChangeBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ status: "error", message: "Booking not found" });
    }
    if (booking.bookingStatus === "Confirmed") {
      return res.status(400).json({ status: "error", message: "Booking is already confirmed" });
    }
    booking.bookingStatus = "Confirmed";
    await booking.save();
    res.json({ status: "success", message: "Booking status updated to Confirmed", booking });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server error updating booking status" });
  }
};


// Get bookings for logged-in user
export const getMyBookings = async (req, res) => {
  try {
    // Get all bookings for the logged-in user
    const bookings = await Booking.find({ userId: req.user.id });

    // For each booking, fetch the corresponding package images
    const bookingsWithImages = await Promise.all(
      bookings.map(async (booking) => {
        const pkg = await Package.findById(booking.packageId).select('images');
        return {
          ...booking.toObject(),
          packageImages: pkg ? pkg.images : [] // add images or empty array if not found
        };
      })
    );

    res.json(bookingsWithImages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!booking || booking.status === "confirmed") {
      return res.status(403).json({ error: "Booking cannot be canceled" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};

// Admin: View all bookings
export const getAllBookings = async (req, res) => {
  try {

    const bookings = await Booking.find()

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all bookings" });
  }
};

// Edit a booking (only by the user who created it)
export const editBooking = async (req, res) => {
  try {
    const { id } = req.params; // booking ID from the URL
    const { travelDate, travelers, contactInfo } = req.body; // editable fields

    // Find the booking owned by the user
    const booking = await Booking.findOne({ _id: id, userId: req.user.id });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found or not owned by user" });
    }

    // You can restrict editing depending on status
    if (booking.status === "confirmed") {
      return res.status(403).json({ error: "Confirmed bookings cannot be edited" });
    }

    // Update only allowed fields
    if (travelDate) booking.travelDate = new Date(travelDate);
    if (travelers) booking.travelers = Number(travelers);
    if (contactInfo) booking.contactInfo = contactInfo;

    await booking.save();

    res.json({ message: "Booking updated successfully", booking });
  } catch (error) {
    console.error("Booking edit error:", error);
    res.status(500).json({ error: "Failed to edit booking", details: error.message });
  }
};

