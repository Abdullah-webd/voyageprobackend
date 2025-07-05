import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// 📧 Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // From your .env
    pass: process.env.EMAIL_PASS, // Gmail app password
  },
});

// ✅ REGISTER
export const register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    console.log("📥 Registering:", email);

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const user = new User({ firstname, lastname, email, password });

    // 🔐 Create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = verificationToken;
    user.emailTokenExpiresAt = Date.now() + 1000 * 60 * 60; // 1 hour

    await user.save();

    const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;

    // 📧 Send verification email
    await transporter.sendMail({
      from: `"Voyage Travel" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verify Your Email - Voyage Travel",
      html: `
        <h3>Hello ${user.firstname},</h3>
        <p>Thank you for registering on Voyage Travel.</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}">✅ Verify Email</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const adminRegister = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    console.log("📥 Admin Registering:", email);
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.role === "admin") {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const user = new User({
      firstname,
      lastname,
      email,
      password,
      role: "admin", // Set role to admin
    });

    // 🔐 Create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = verificationToken;
    user.emailTokenExpiresAt = Date.now() + 1000 * 60 * 60; // 1 hour

    await user.save();
    console.log("✅ Admin registered successfully:", user.email);

    const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;

    // 📧 Send verification email
    await transporter.sendMail({
      from: `"Voyage Travel" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verify Your Email - Voyage Travel",
      html: `
        <h3>Hello ${user.firstname},</h3>
        <p>Thank you for registering on Voyage Travel.</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}">✅ Verify Email</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });
    res.status(201).json({
      message: "Admin registered successfully",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin Register Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔐 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔑 Login attempt:", email);

    const user = await User.findOne({ email });

    if (!user) {
      console.warn("❌ No user found");
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      return res
        .status(403)
        .json({ error: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🧪 Password match:", isMatch);

    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log({ id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" })

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// 📬 VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).json({ error: "Missing verification token" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailTokenExpiresAt = undefined;

    await user.save();

    console.log(`✅ Email verified for ${user.email}`);
    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error("Verify Email Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
