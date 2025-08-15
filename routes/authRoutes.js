

import express from 'express';
import { authWithOTP,verifyOTP, completeProfile } from '../controllers/authcontrollers.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authWithOTP);
router.post('/verify-email', verifyOTP);
router.post('/update-profile',authMiddleware, completeProfile); 


export default router


