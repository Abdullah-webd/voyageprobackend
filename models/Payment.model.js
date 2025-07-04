import mongoose from "mongoose";

const paymentsSchema = new mongoose.Schema({
  email: { type: String, required: true },
  packageName: { type: String, required: true },
  travelDate: { type: String, required: true },
  amount: { type: Number, required: true },
  travelers: { type: Number, required: true },
  tx_ref: { type: String, required: true, unique: true },
  confirmed: { type: Boolean, default: false },
}, { timestamps: true });

const Payments = mongoose.model("Payments", paymentsSchema);
export default Payments;
