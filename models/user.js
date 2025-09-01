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
  role:{type:String,default:"user",required:true,enum: ["user", "admin"],},
  otp: String,
  otpExpiresAt: Date,
  isAuthenticated: { type: Boolean, default: false },
  resetPasswordOTP: String,        // OTP for password reset
  resetPasswordOTPExpiresAt: Date,
}, { timestamps: true });

// Hash password before saving

export default mongoose.model("User", userSchema);
