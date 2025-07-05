import {Booking} from "../models/booking.js";
// Create new booking
export const createBooking = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    console.log("BODY:", req.body);

    const { packageId, travelDate, travelers, contactInfo,packageName } = req.body;

    const booking = new Booking({
      userId: req.user?._id || req.user?.id,
      packageId,
      packageName,
      travelDate: new Date(travelDate),
      travelers: Number(travelers),
      contactInfo,
      status: "pending"
    });

    console.log("Booking to be saved:", booking);

    await booking.save();

    res.status(201).json({ message: "Booking created", booking });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({ error: "Failed to create booking", details: error.message });
  }
};


// Get bookings for logged-in user
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id });
    res.json(bookings);
  } catch (error) {
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

    if(!req.query.packageId){
      res.json({message:'Package Id is required to get all bookings'});
      return;
    }
    const bookings = await Booking.find({packageId: req.query.packageId})
    if(!bookings){
      res.json({message: "No bookings found for this package"});
      return;
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all bookings" });
  }
};
