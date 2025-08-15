import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  country: String,
  phoneNumber: String,
  state: String,
  isProfileComplete: { type: Boolean, default: false },

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  otp: String,
  otpExpiresAt: Date,
  isAuthenticated: { type: Boolean, default: false },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
