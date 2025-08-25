import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Booking } from "../models/booking.js";
import Payments from "../models/Payment.model.js";

// Email setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user:"webmastersmma@gmail.com",
    pass: "hkefujrkxqzvghbt",
  },
});

// Generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP Email
const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Voyage Travel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code - Voyage Travel",
    html: `<h3>Your OTP Code is:</h3><h2>${otp}</h2><p>This code expires in 10 minutes.</p>`,
  });
};

// ✅ SIGNUP / LOGIN (Email & Password → OTP)
export const authWithOTP = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password){
      return res.status(400).json({ error: "Email and password are required" });
    }
    let user = await User.findOne({ email });

    // ===== SIGNUP =====
    if (!user) {
      user = new User({ email, password });
    } else {
      // ===== LOGIN — Check password =====
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch){
        console.log(isMatch,user.password,password);
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // ===== If already authenticated =====
      if (user.isAuthenticated) {
        const isProfileIncomplete = user.isProfileComplete === true ? true : false;
        console.log("User profile complete:",user.isProfileComplete);

        if (!isProfileIncomplete) {
          return res.status(200).json({
            message: "Please complete your profile before proceeding.",
            redirect: "/complete-profile",
          });
        }

        // Profile complete → direct login
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });

        return res.status(200).json({
          message: "Login successful.",
          user,
          token,
          redirect: "/dashboard",
        });
      }

      // ===== If not authenticated → handle OTP =====
      const now = Date.now();
      if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < now) {
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiresAt = now + 10 * 60 * 1000; // 10 min
        await user.save();

        await sendOTPEmail(user.email, otp);

        return res.status(403).json({
          message: "User not verified. OTP sent again.",
          redirect: "/verify-otp",
        });
      } else {
        const remainingTime = Math.ceil((user.otpExpiresAt - now) / 1000);
        return res.status(403).json({
          message: `User not verified. Please check your email. OTP expires in ${remainingTime} seconds.`,
          redirect: "/verify-otp",
        });
      }
    }

    // ===== Brand new signup → send OTP =====
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    await sendOTPEmail(user.email, otp);

    res.status(201).json({
      message: "OTP sent to your email. Please verify.",
      redirect: "/verify-otp",
    });
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};



// ✅ VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP are required" });

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.otp !== otp || Date.now() > user.otpExpiresAt)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    // Mark user as authenticated
    user.isAuthenticated = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Create token after verification
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "OTP verified successfully. Login complete.",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const { firstname, lastname, country, phoneNumber, state } = req.body;

    if (!firstname || !lastname || !country || !phoneNumber || !state) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const userId = req.user.id; // From JWT middleware
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    user.firstname = firstname;
    user.lastname = lastname;
    user.country = country;
    user.phoneNumber = phoneNumber;
    user.state = state;
    user.isProfileComplete = true; // Mark profile as complete

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        country: user.country,
        phoneNumber: user.phoneNumber,
        state: user.state
      }
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// DELETE ACCOUNT
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; // get user id from JWT middleware

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete Account Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({ error: "Email, OTP, and new password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.resetPasswordOTP !== otp || Date.now() > user.resetPasswordOTPExpiresAt){
      console.log(user.resetPasswordOTP, otp, Date.now(), user.resetPasswordOTPExpiresAt);
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiresAt = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// REQUEST PASSWORD RESET
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate OTP for password reset
    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await transporter.sendMail({
      from: `"Voyage Travel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - Voyage Travel",
      html: `<h3>Your password reset OTP is:</h3><h2>${otp}</h2><p>This code expires in 10 minutes.</p>`,
    });

    res.status(200).json({ message: "OTP sent to your email for password reset." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const getAdminDashboard = async (req, res) => {
  try {
    // 1️⃣ Total bookings
    const totalBookings = await Booking.countDocuments();

    // 2️⃣ Total client revenue
    const revenueResult = await Payments.aggregate([
      { $match: { bookingStatus: "Confirmed" } }, // only confirmed payments
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmountPaid" } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // 3️⃣ Top destinations (most booked packages)
    const topDestinations = await Booking.aggregate([
      { $group: { _id: "$packageName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // 4️⃣ Recent bookings (latest 5 bookings)
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "firstname lastname email phoneNumber");

    res.status(200).json({
      totalBookings,
      totalRevenue,
      topDestinations,
      recentBookings,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

