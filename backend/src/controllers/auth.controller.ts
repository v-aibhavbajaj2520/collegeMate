import bcrypt from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../utils/email.js';
import { generateOTP, generateToken } from '../utils/helpers.js';
import { googleClient } from '../utils/google.js';
import { createWelcomeNotification } from '../utils/notifications.js';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/authenticate.js';

export function requireUser(req: AuthRequest): asserts req is AuthRequest & { user: JwtPayload } {
  if (!req.user) throw new Error("User not authenticated");
}

// Signup
export const signup = async (req: Request, res: Response) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
		if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });

		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser && existingUser.isVerified) return res.status(400).json({ success: false, message: 'User with this email already exists' });

		const hashedPassword = await bcrypt.hash(password, 12);
		const otp = generateOTP();
		const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

		if (existingUser && !existingUser.isVerified) {
			await prisma.user.update({ where: { email }, data: { name, password: hashedPassword, otp, otpExpiresAt: expiresAt, updatedAt: new Date() } });
		} else {
			await prisma.user.create({ data: { name, email, password: hashedPassword, otp, otpExpiresAt: expiresAt, isVerified: false } });
		}

		const emailResult = await sendOTPEmail(email, otp, name);
		if (emailResult.success) console.log(`📧 OTP sent to ${email}`);

		res.json({ success: true, message: 'OTP sent to your email address' });
	} catch (error) {
		console.error('Signup error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

// verify-otp
export const verifyOtp = async (req: Request, res: Response) => {
	try {
		const { email, otp } = req.body;
		if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

		const user = await prisma.user.findFirst({ where: { email, otp } });
		if (!user) return res.status(400).json({ success: false, message: 'Invalid OTP' });
		if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });

		const updatedUser = await prisma.user.update({ where: { id: user.id }, data: { isVerified: true, otp: null, otpExpiresAt: null, updatedAt: new Date() }, select: { id: true, email: true, name: true, role: true, isVerified: true, createdAt: true } });

		const token = generateToken(updatedUser.id, updatedUser.email, updatedUser.role);
    
		// Create welcome notification for first-time login
		await createWelcomeNotification(updatedUser.id);
    
		res.json({ success: true, message: 'Email verified successfully', token, user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role, isVerified: updatedUser.isVerified } });
	} catch (error) {
		console.error('OTP verification error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

// resend-otp
export const resendOtp = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return res.status(400).json({ success: false, message: 'No account found with this email' });
		if (user.isVerified) return res.status(400).json({ success: false, message: 'This account is already verified' });

		const otp = generateOTP();
		const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
		await prisma.user.update({ where: { email }, data: { otp, otpExpiresAt: expiresAt, updatedAt: new Date() } });
		const emailResult = await sendOTPEmail(email, otp, user.name);
		if (emailResult.success) console.log(`📧 OTP resent to ${email}`);
		res.json({ success: true, message: 'New OTP sent to your email address' });
	} catch (error) {
		console.error('Resend OTP error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

// login (send otp)
export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user || !user.password) return res.status(400).json({ success: false, message: 'Invalid email or password' });
		if (!user.isVerified) return res.status(400).json({ success: false, message: 'Please verify your email first. Check your inbox for the verification OTP.' });

		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) return res.status(400).json({ success: false, message: 'Invalid email or password' });

		const otp = generateOTP();
		const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
		await prisma.user.update({ where: { email }, data: { otp, otpExpiresAt: expiresAt, updatedAt: new Date() } });
		const emailResult = await sendOTPEmail(email, otp, user.name);
		if (emailResult.success) console.log(`📧 Login OTP sent to ${email}`);

		res.json({ success: true, message: 'OTP sent to your email for login verification', requiresOTP: true });
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

// verify-login-otp
export const verifyLoginOtp = async (req: Request, res: Response) => {
	try {
		const { email, otp } = req.body;
		if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

		const user = await prisma.user.findFirst({ where: { email, otp, isVerified: true } });
		if (!user) return res.status(400).json({ success: false, message: 'Invalid OTP' });
		if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });

		const updatedUser = await prisma.user.update({ where: { id: user.id }, data: { otp: null, otpExpiresAt: null, updatedAt: new Date() }, select: { id: true, email: true, name: true, role: true, isVerified: true, createdAt: true } });
		const token = generateToken(updatedUser.id, updatedUser.email, updatedUser.role);

		// Create welcome notification for login
		await createWelcomeNotification(updatedUser.id);

		res.json({ success: true, message: 'Login successful', token, user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role, isVerified: updatedUser.isVerified } });
	} catch (error) {
		console.error('Login OTP verification error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

// forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return res.status(400).json({ success: false, message: 'No account found with this email address' });

		const resetToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', { expiresIn: '1h' });
		const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
		console.log(`🔐 Password reset requested for: ${email}`);
		console.log(`🔗 Reset link: ${resetLink}`);
		const emailResult = await sendPasswordResetEmail(email, resetLink, user.name);
		if (emailResult.success) console.log(`📧 Password reset email sent to ${email}`);

		res.json({ success: true, message: 'Password reset link sent to your email address' });
	} catch (error) {
		console.error('❌ Forgot password error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

// reset-password
export const resetPassword = async (req: Request, res: Response) => {
	try {
		const { token, newPassword } = req.body;
		if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password are required' });
		if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });

		let decoded: any;
		try { decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production'); } catch (err) { return res.status(400).json({ success: false, message: 'Invalid or expired reset token' }); }

		const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
		if (!user) return res.status(400).json({ success: false, message: 'User not found' });

		const hashedPassword = await bcrypt.hash(newPassword, 12);
		await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword, updatedAt: new Date() } });

		res.json({ success: true, message: 'Password reset successful' });
	} catch (error) {
		console.error('❌ Password reset error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

// Google OAuth endpoints
export const getGoogleAuthUrl = (req: Request, res: Response) => {
	const authUrl = googleClient.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'], prompt: 'consent' });
	res.json({ success: true, authUrl });
};

export const googleCallback = async (req: Request, res: Response) => {
	try {
		const { code } = req.body;
		if (!code) return res.status(400).json({ success: false, message: 'Authorization code is required' });
		const { tokens } = await googleClient.getToken(code);
		googleClient.setCredentials(tokens);
		// use global fetch (node 18+) to retrieve Google user info
		const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
		const googleUserInfo = await userInfoResponse.json();

		let user = await prisma.user.findUnique({ where: { email: googleUserInfo.email } });
		if (user) {
			if (!user.googleId) user = await prisma.user.update({ where: { id: user.id }, data: { googleId: googleUserInfo.id, isVerified: true, updatedAt: new Date() } });
		} else {
			user = await prisma.user.create({ data: { email: googleUserInfo.email, name: googleUserInfo.name, googleId: googleUserInfo.id, isVerified: true, password: null } });
		}

		const token = generateToken(user.id, user.email, user.role);
    
		// Create welcome notification for Google OAuth login
		await createWelcomeNotification(user.id);
    
		res.json({ success: true, message: 'Google authentication successful', token, user: { id: user.id, email: user.email, name: user.name, role: user.role, isVerified: user.isVerified } });
	} catch (error) {
		console.error('❌ Google OAuth error:', error);
		res.status(500).json({ success: false, message: 'Google authentication failed' });
	}
};

export const googleVerify = async (req: Request, res: Response) => {
	try {
		const { idToken } = req.body;
		if (!idToken) return res.status(400).json({ success: false, message: 'ID token is required' });
		const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID! });
		const payload = ticket.getPayload();
		if (!payload || !payload.email) return res.status(400).json({ success: false, message: 'Invalid Google token' });

		let user = await prisma.user.findUnique({ where: { email: payload.email } });
		if (user) {
			if (!user.googleId) user = await prisma.user.update({ where: { id: user.id }, data: { googleId: payload.sub, isVerified: true, updatedAt: new Date() } });
		} else {
			user = await prisma.user.create({ data: { email: payload.email!, name: payload.name || 'User', googleId: payload.sub, isVerified: true, password: null } });
		}

		const token = generateToken(user.id, user.email, user.role);
    
		// Create welcome notification for Google OAuth login
		await createWelcomeNotification(user.id);
    
		res.json({ success: true, message: 'Google authentication successful', token, user: { id: user.id, email: user.email, name: user.name, role: user.role, isVerified: user.isVerified } });
	} catch (error) {
		console.error('❌ Google token verification error:', error);
		res.status(500).json({ success: false, message: 'Google authentication failed' });
	}
};

// Protected routes
export const getMe = async (req: AuthRequest, res: Response) => {
	try {
        requireUser(req);
		const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, email: true, name: true, role: true, isVerified: true, googleId: true, createdAt: true, updatedAt: true } });
		if (!user) return res.status(404).json({ success: false, message: 'User not found' });
		res.json({ success: true, user });
	} catch (error) {
		console.error('Get user error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
	try {
		const { name } = req.body;
		if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
		requireUser(req);
		const updatedUser = await prisma.user.update({ where: { id: req.user.userId }, data: { name, updatedAt: new Date() }, select: { id: true, email: true, name: true, role: true, isVerified: true } });
		res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
	} catch (error) {
		console.error('Update profile error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

export const changePassword = async (req: AuthRequest, res: Response) => {
	try {
		const { currentPassword, newPassword } = req.body;
		if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Current password and new password are required' });
		if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });

		requireUser(req);
		const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
		if (!user || !user.password) return res.status(400).json({ success: false, message: 'Cannot change password for OAuth users' });
		const isValidPassword = await bcrypt.compare(currentPassword, user.password);
		if (!isValidPassword) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

		const hashedPassword = await bcrypt.hash(newPassword, 12);
		await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword, updatedAt: new Date() } });
		res.json({ success: true, message: 'Password changed successfully' });
	} catch (error) {
		console.error('Change password error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

export const logout = (req: Request, res: Response) => {
	res.json({ success: true, message: 'Logged out successfully' });
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
	try {
		requireUser(req);
		await prisma.user.delete({ where: { id: req?.user?.userId } });
		res.json({ success: true, message: 'Account deleted successfully' });
	} catch (error) {
		console.error('Delete account error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

