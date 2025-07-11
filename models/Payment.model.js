import mongoose from "mongoose";

const paymentsSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  travelDate: {
    type: Date,
    required: true
  },
  numberOfGuests: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["Credit/Debit Card", "Pay on Arrival", "Bank Transfer", "Mobile Payment"],
    required: true
  },
  includeAirportPickup: {
    type: Boolean,
    default: false
  },
  addTravelInsurance: {
    type: Boolean,
    default: false
  },
  bookingStatus: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Pending"
  },
  packageId: {
    type: String,
    required: true
  },
   packageName: { type: String, required: true },
  costPerPerson: { type: Number, required: true },
  totalAmountPaid: { type: Number, required: true },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tx_ref: { type: String, required: true, unique: true },
}, { timestamps: true });

const Payments = mongoose.model("Payments", paymentsSchema);
export default Payments;
