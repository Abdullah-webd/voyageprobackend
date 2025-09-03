import jwt from 'jsonwebtoken';
import User from "../models/user.js";

export const checkRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newuser = decoded; // Attach user info (id, role) to request
    req.user = await User.findById(newuser.id)
    console.log(req.user)
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};