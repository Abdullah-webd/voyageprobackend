

import express from 'express';
import { authWithOTP,verifyOTP, completeProfile, deleteAccount, forgotPassword , resetPassword, getAdminDashboard } from '../controllers/authcontrollers.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authWithOTP);
router.post('/verify-email', verifyOTP);
router.post('/update-profile',authMiddleware, completeProfile); 
router.delete('/delete-account',authMiddleware, deleteAccount);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get("/admin-dashboard", getAdminDashboard);

export default router


