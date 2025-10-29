import express from 'express';
import { authenticateToken } from '../middleware/authenticate.js';
import {
  signup,
  verifyOtp,
  resendOtp,
  login,
  verifyLoginOtp,
  forgotPassword,
  resetPassword,
  getGoogleAuthUrl,
  googleCallback,
  googleVerify,
  getMe,
  updateProfile,
  changePassword,
  logout,
  deleteAccount,
} from '../controllers/auth.controller.js';

const router = express.Router();

// Signup
router.post('/signup', signup);

// verify-otp
router.post('/verify-otp', verifyOtp);

// resend-otp
router.post('/resend-otp', resendOtp);

// login (send otp)
router.post('/login', login);

// verify-login-otp
router.post('/verify-login-otp', verifyLoginOtp);

// forgot-password
router.post('/forgot-password', forgotPassword);

// reset-password
router.post('/reset-password', resetPassword);

// Google OAuth endpoints
router.get('/google', getGoogleAuthUrl);
router.post('/google/callback', googleCallback);
router.post('/google/verify', googleVerify);

// Protected routes
router.get('/me', authenticateToken, getMe);

router.put('/update-profile', authenticateToken, updateProfile);

router.post('/change-password', authenticateToken, changePassword);

router.post('/logout', authenticateToken, logout);

router.delete('/delete-account', authenticateToken, deleteAccount);

export default router;
