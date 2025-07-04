import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define the User schema
const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },

  lastname: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  // 🔐 Email Verification Fields
  emailVerificationToken: {
    type: String,
  },

  emailVerified: {
    type: Boolean,
    default: false,
  },

  emailTokenExpiresAt: {
    type: Date,
  },
}, {
  timestamps: true
});

// Middleware: Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Export the User model
const User = mongoose.model("User", userSchema);
export default User;
