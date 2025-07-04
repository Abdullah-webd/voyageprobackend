import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected route
router.get("/private", authMiddleware, (req, res) => {
  res.json({
    message: `Hello ${req.user.role}, your token is valid.`,
    user: req.user
  });
});

export default router
