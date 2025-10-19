import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { PrismaClient } from '../generated/prisma/index.js';
import { OAuth2Client } from 'google-auth-library';
const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();
// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback');
// Middleware
app.use(cors());
app.use(express.json());
// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// Email configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-app-password'
        }
    });
};
// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: email,
            subject: 'CollegeMate - Verify Your Account',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #0066FF, #4690FE); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">CollegeMate</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your College Journey Mate</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2E3031; margin: 0 0 20px 0; font-size: 24px;">Welcome ${name}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for signing up with CollegeMate! To complete your registration, please verify your email address using the OTP below:
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Your verification code is:</p>
              <div style="background: linear-gradient(135deg, #0066FF, #4690FE); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 20px; border-radius: 8px; display: inline-block;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
              This code will expire in 5 minutes. If you didn't request this verification, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2024 CollegeMate. All rights reserved.</p>
          </div>
        </div>
      `
        };
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ OTP email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    }
    catch (error) {
        console.error('❌ Error sending OTP email:', error);
        console.log(`\n🔐 OTP for ${email}: ${otp}\n`);
        return { success: false, error: error.message };
    }
};
// Send password reset email
const sendPasswordResetEmail = async (email, resetLink, name) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: email,
            subject: 'CollegeMate - Reset Your Password',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #0066FF, #4690FE); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">CollegeMate</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your College Journey Mate</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2E3031; margin: 0 0 20px 0; font-size: 24px;">Password Reset Request</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello ${name || 'there'},<br><br>
              We received a request to reset your password for your CollegeMate account. Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #0066FF, #4690FE); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
              If you didn't request this password reset, please ignore this email. This link will expire in 1 hour for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2024 CollegeMate. All rights reserved.</p>
          </div>
        </div>
      `
        };
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    }
    catch (error) {
        console.error('❌ Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};
// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// Generate JWT Token
const generateToken = (userId, email, role) => {
    return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
};
// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};
// Cleanup expired OTPs (runs periodically)
const cleanupExpiredOTPs = async () => {
    try {
        const result = await prisma.user.updateMany({
            where: {
                otpExpiresAt: {
                    lt: new Date()
                }
            },
            data: {
                otp: null,
                otpExpiresAt: null
            }
        });
        if (result.count > 0) {
            console.log(`🧹 Cleaned up ${result.count} expired OTPs`);
        }
    }
    catch (error) {
        console.error('Error cleaning up OTPs:', error);
    }
};
// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'College Mate Backend Server is running!' });
});
// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// ==================== AUTHENTICATION ROUTES ====================
// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }
        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
        // Create or update user with OTP
        if (existingUser && !existingUser.isVerified) {
            // Update existing unverified user
            await prisma.user.update({
                where: { email },
                data: {
                    name,
                    password: hashedPassword,
                    otp,
                    otpExpiresAt: expiresAt,
                    updatedAt: new Date()
                }
            });
        }
        else {
            // Create new user
            await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    otp,
                    otpExpiresAt: expiresAt,
                    isVerified: false
                }
            });
        }
        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, name);
        if (emailResult.success) {
            console.log(`📧 OTP sent to ${email}`);
        }
        else {
            console.log(`⚠️ Email failed, OTP logged to console: ${otp}`);
        }
        res.json({
            success: true,
            message: 'OTP sent to your email address'
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }
        // Find user with matching email and OTP
        const user = await prisma.user.findFirst({
            where: {
                email,
                otp
            }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }
        // Check if OTP is expired
        if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }
        // Verify user and clear OTP
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                otp: null,
                otpExpiresAt: null,
                updatedAt: new Date()
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true,
                createdAt: true
            }
        });
        // Generate JWT token
        const token = generateToken(updatedUser.id, updatedUser.email, updatedUser.role);
        res.json({
            success: true,
            message: 'Email verified successfully',
            token,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                isVerified: updatedUser.isVerified
            }
        });
    }
    catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/auth/resend-otp
app.post('/api/auth/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'No account found with this email'
            });
        }
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'This account is already verified'
            });
        }
        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        // Update user with new OTP
        await prisma.user.update({
            where: { email },
            data: {
                otp,
                otpExpiresAt: expiresAt,
                updatedAt: new Date()
            }
        });
        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, user.name);
        if (emailResult.success) {
            console.log(`📧 OTP resent to ${email}`);
        }
        else {
            console.log(`⚠️ Email failed, OTP logged to console: ${otp}`);
        }
        res.json({
            success: true,
            message: 'New OTP sent to your email address'
        });
    }
    catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/auth/login - Step 1: Verify credentials and send OTP
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user || !user.password) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Please verify your email first. Check your inbox for the verification OTP.'
            });
        }
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Generate OTP for login
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        // Store login OTP
        await prisma.user.update({
            where: { email },
            data: {
                otp,
                otpExpiresAt: expiresAt,
                updatedAt: new Date()
            }
        });
        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, user.name);
        if (emailResult.success) {
            console.log(`📧 Login OTP sent to ${email}`);
        }
        else {
            console.log(`⚠️ Email failed, login OTP logged to console: ${otp}`);
        }
        res.json({
            success: true,
            message: 'OTP sent to your email for login verification',
            requiresOTP: true
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/auth/verify-login-otp - Step 2: Verify OTP and complete login
app.post('/api/auth/verify-login-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }
        // Find user with matching email and OTP
        const user = await prisma.user.findFirst({
            where: {
                email,
                otp,
                isVerified: true
            }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }
        // Check if OTP is expired
        if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }
        // Clear OTP after successful login
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                otp: null,
                otpExpiresAt: null,
                updatedAt: new Date()
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true,
                createdAt: true
            }
        });
        // Generate JWT token
        const token = generateToken(updatedUser.id, updatedUser.email, updatedUser.role);
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                isVerified: updatedUser.isVerified
            }
        });
    }
    catch (error) {
        console.error('Login OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'No account found with this email address'
            });
        }
        // Generate reset token
        const resetToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        console.log(`🔐 Password reset requested for: ${email}`);
        console.log(`🔗 Reset link: ${resetLink}`);
        // Send password reset email
        const emailResult = await sendPasswordResetEmail(email, resetLink, user.name);
        if (emailResult.success) {
            console.log(`📧 Password reset email sent to ${email}`);
        }
        else {
            console.log(`⚠️ Email failed, reset link: ${resetLink}`);
        }
        res.json({
            success: true,
            message: 'Password reset link sent to your email address'
        });
    }
    catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }
        // Validate new password
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }
        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        // Find user
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }
        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                updatedAt: new Date()
            }
        });
        res.json({
            success: true,
            message: 'Password reset successful'
        });
    }
    catch (error) {
        console.error('❌ Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// ==================== GOOGLE OAUTH ROUTES ====================
// GET /api/auth/google - Initiate Google OAuth
app.get('/api/auth/google', (req, res) => {
    const authUrl = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        prompt: 'consent'
    });
    res.json({
        success: true,
        authUrl
    });
});
// POST /api/auth/google/callback - Handle Google OAuth callback
app.post('/api/auth/google/callback', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Authorization code is required'
            });
        }
        // Exchange code for tokens
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`
            }
        });
        const googleUserInfo = await userInfoResponse.json();
        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email: googleUserInfo.email }
        });
        if (user) {
            // Update existing user with Google ID if not set
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: googleUserInfo.id,
                        isVerified: true,
                        updatedAt: new Date()
                    }
                });
            }
        }
        else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email: googleUserInfo.email,
                    name: googleUserInfo.name,
                    googleId: googleUserInfo.id,
                    isVerified: true,
                    password: null // No password for Google OAuth users
                }
            });
        }
        // Generate JWT token
        const token = generateToken(user.id, user.email, user.role);
        res.json({
            success: true,
            message: 'Google authentication successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    }
    catch (error) {
        console.error('❌ Google OAuth error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed'
        });
    }
});
// POST /api/auth/google/verify - Verify Google ID Token (Alternative method)
app.post('/api/auth/google/verify', async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'ID token is required'
            });
        }
        // Verify the ID token
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Google token'
            });
        }
        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email: payload.email }
        });
        if (user) {
            // Update existing user with Google ID if not set
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: payload.sub,
                        isVerified: true,
                        updatedAt: new Date()
                    }
                });
            }
        }
        else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email: payload.email,
                    name: payload.name || 'User',
                    googleId: payload.sub,
                    isVerified: true,
                    password: null
                }
            });
        }
        // Generate JWT token
        const token = generateToken(user.id, user.email, user.role);
        res.json({
            success: true,
            message: 'Google authentication successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    }
    catch (error) {
        console.error('❌ Google token verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed'
        });
    }
});
// ==================== PROTECTED ROUTES ====================
// GET /api/auth/me - Get current user info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true,
                googleId: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            user
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// PUT /api/auth/update-profile - Update user profile
app.put('/api/auth/update-profile', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }
        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                name,
                updatedAt: new Date()
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true
            }
        });
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/auth/change-password - Change password for authenticated user
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });
        if (!user || !user.password) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change password for OAuth users'
            });
        }
        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                updatedAt: new Date()
            }
        });
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// POST /api/auth/logout - Logout user (client-side token removal)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});
// DELETE /api/auth/delete-account - Delete user account
app.delete('/api/auth/delete-account', authenticateToken, async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.user.userId }
        });
        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'An unexpected error occurred'
    });
});
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Enabled' : 'Disabled (using console fallback)'}`);
    console.log(`🧹 Auto-cleanup: Every 5 minutes`);
    console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/auth/`);
    console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Enabled' : 'Disabled'}`);
});
export default app;
//# sourceMappingURL=index.js.map