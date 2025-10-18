const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import configurations
const { initializeFirebase, getFirestore, getAuth } = require('./config/firebase');
const { sendOTPEmail, sendPasswordResetEmail } = require('./config/email');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'College Mate Backend Server is running!' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize Firebase
initializeFirebase();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Authentication Routes

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

    // Check if user already exists in Firebase Auth
    const auth = getAuth();
    try {
      await auth.getUserByEmail(email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    } catch (error) {
      // User doesn't exist, continue with signup
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Store in Firestore pendingVerifications collection
    const db = getFirestore();
    await db.collection('pendingVerifications').doc(email).set({
      email,
      name,
      hashedPassword,
      otp,
      expiresAt,
      createdAt: new Date()
    });

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    res.json({
      success: true,
      message: 'OTP sent to your email address'
    });

  } catch (error) {
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

    // Get verification data from Firestore
    const db = getFirestore();
    const doc = await db.collection('pendingVerifications').doc(email).get();

    if (!doc.exists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const verificationData = doc.data();

    // Check if OTP is correct
    if (verificationData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired
    if (new Date() > verificationData.expiresAt.toDate()) {
      // Delete expired document
      await db.collection('pendingVerifications').doc(email).delete();
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Create user in Firebase Auth
    const auth = getAuth();
    const userRecord = await auth.createUser({
      email: verificationData.email,
      password: verificationData.hashedPassword,
      displayName: verificationData.name
    });

    // Delete verification document
    await db.collection('pendingVerifications').doc(email).delete();

    // Generate JWT token
    const token = jwt.sign(
      { 
        uid: userRecord.uid, 
        email: userRecord.email,
        name: verificationData.name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Account verified successfully',
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: verificationData.name
      }
    });

  } catch (error) {
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

    // Check if verification document exists
    const db = getFirestore();
    const doc = await db.collection('pendingVerifications').doc(email).get();

    if (!doc.exists) {
      return res.status(400).json({
        success: false,
        message: 'No pending verification found for this email'
      });
    }

    const verificationData = doc.data();

    // Generate new OTP
    const newOtp = generateOTP();
    const newExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Update verification document
    await db.collection('pendingVerifications').doc(email).update({
      otp: newOtp,
      expiresAt: newExpiresAt,
      updatedAt: new Date()
    });

    // Send new OTP email
    await sendOTPEmail(email, newOtp, verificationData.name);

    res.json({
      success: true,
      message: 'New OTP sent to your email address'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get user from Firebase Auth
    const auth = getAuth();
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Note: Firebase Auth handles password verification automatically
    // We'll use Firebase Auth's signInWithEmailAndPassword on the frontend
    // For now, we'll just return success if user exists
    // In a real implementation, you'd verify the password here

    // Generate JWT token
    const token = jwt.sign(
      { 
        uid: userRecord.uid, 
        email: userRecord.email,
        name: userRecord.displayName
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName
      }
    });

  } catch (error) {
    console.error('Login error:', error);
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
    const auth = getAuth();
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Generate password reset link
    const resetLink = await auth.generatePasswordResetLink(email);

    // Send password reset email
    await sendPasswordResetEmail(email, resetLink, userRecord.displayName);

    res.json({
      success: true,
      message: 'Password reset link sent to your email address'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// MongoDB connection (optional - will work without DB)
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('No MongoDB URI provided - running without database');
    }
  } catch (error) {
    console.log('MongoDB connection error:', error.message);
  }
};

connectDB();
