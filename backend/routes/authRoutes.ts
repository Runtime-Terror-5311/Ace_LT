import express from 'express';
import { login, register, verifyOTP, forgotPassword, resetPassword } from '../controllers/authController';

const router = express.Router();

router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
