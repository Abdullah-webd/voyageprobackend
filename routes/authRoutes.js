

import express from 'express';
import { register, login, verifyEmail } from '../controllers/authcontrollers.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail); // ✅ new route

export default router


