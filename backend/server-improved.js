const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Import Firebase configuration
const { initializeFirebase, getFirestore, getAuth } = require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase
initializeFirebase();

// In-memory storage for demo (replace with database in production)
const pendingVerifications = new Map();
const users = new Map();
const loginOTPs = new Map(); // For login OTP verification

// Get Firestore instance
const db = getFirestore();

// Admin emails (hardcoded for now)
const ADMIN_EMAILS = [
  'admin1@collegemate.com',
  'admin2@collegemate.com',
  'vaibhav.bajaj.cs27@iilm.edu' // Adding your email as admin for testing
];

// Role determination function
const determineUserRole = (email, userData = {}) => {
  // Check if user is admin
  if (ADMIN_EMAILS.includes(email.toLowerCase())) {
    return 'admin';
  }
  
  // Check if user is mentor (placeholder logic)
  if (userData.isMentor === true) {
    return 'mentor';
  }
  
  // Default role
  return 'user';
};

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
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    // Fallback to console log if email fails
    console.log(`\n🔐 OTP for ${email}: ${otp}\n`);
    return { success: false, error: error.message };
  }
};

// Cleanup expired OTPs (similar to your Cloud Function)
const cleanupExpiredOTPs = async () => {
  const now = new Date();
  let cleanedCount = 0;
  
  // Cleanup signup OTPs from memory
  for (const [email, data] of pendingVerifications.entries()) {
    if (now > data.expiresAt) {
      pendingVerifications.delete(email);
      cleanedCount++;
    }
  }
  
  // Cleanup login OTPs from memory
  for (const [email, data] of loginOTPs.entries()) {
    if (now > data.expiresAt) {
      loginOTPs.delete(email);
      cleanedCount++;
    }
  }

  // Cleanup expired OTPs from Firestore
  try {
    console.log('🧹 Cleaning up expired OTPs from Firestore...');
    const expiredDocs = await db.collection('pendingVerifications')
      .where('expiresAt', '<', now)
      .get();
    
    const batch = db.batch();
    expiredDocs.forEach(doc => {
      batch.delete(doc.ref);
      cleanedCount++;
    });
    
    if (expiredDocs.size > 0) {
      await batch.commit();
      console.log(`🧹 Cleaned up ${expiredDocs.size} expired OTP documents from Firestore`);
    }
  } catch (firestoreError) {
    console.error('❌ Error cleaning up Firestore:', firestoreError);
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Total cleaned up: ${cleanedCount} expired OTP documents`);
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

    // Check if user already exists
    if (users.has(email)) {
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

    // Store in memory (for immediate access)
    pendingVerifications.set(email, {
      email,
      name,
      hashedPassword,
      otp,
      expiresAt,
      createdAt: new Date()
    });

    // Also store in Firestore with proper error handling
    try {
      console.log('📝 Storing OTP data in Firestore...');
      console.log('📊 Data to store:', {
        email,
        name,
        hashedPassword: hashedPassword.substring(0, 20) + '...', // Log partial password for security
        otp,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      });

      await db.collection('pendingVerifications').doc(email).set({
        email,
        name,
        hashedPassword,
        otp,
        expiresAt: expiresAt, // Firestore will handle timestamp conversion
        createdAt: new Date()
      });

      console.log('✅ OTP data stored in Firestore successfully');
    } catch (firestoreError) {
      console.error('❌ Firestore write failed:', firestoreError);
      // Continue with in-memory storage even if Firestore fails
      console.log('⚠️ Continuing with in-memory storage only');
    }

    // Send OTP email automatically
    const emailResult = await sendOTPEmail(email, otp, name);
    
    if (emailResult.success) {
      console.log(`📧 OTP sent to ${email}`);
    } else {
      console.log(`⚠️ Email failed, OTP logged to console: ${otp}`);
    }

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

    // Get verification data from memory first
    let verificationData = pendingVerifications.get(email);

    // If not in memory, try to get from Firestore
    if (!verificationData) {
      try {
        console.log('🔍 Checking Firestore for OTP data...');
        const doc = await db.collection('pendingVerifications').doc(email).get();
        
        if (doc.exists) {
          const data = doc.data();
          verificationData = {
            email: data.email,
            name: data.name,
            hashedPassword: data.hashedPassword,
            otp: data.otp,
            expiresAt: data.expiresAt.toDate(), // Convert Firestore timestamp to Date
            createdAt: data.createdAt.toDate()
          };
          console.log('✅ OTP data found in Firestore');
        }
      } catch (firestoreError) {
        console.error('❌ Error reading from Firestore:', firestoreError);
      }
    }

    if (!verificationData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check if OTP is correct
    if (verificationData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired
    if (new Date() > verificationData.expiresAt) {
      // Delete expired data
      pendingVerifications.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Create user
    const userId = Date.now().toString();
    const userData = {
      uid: userId,
      email: verificationData.email,
      name: verificationData.name,
      hashedPassword: verificationData.hashedPassword,
      createdAt: new Date()
    };
    
    // Determine user role
    const userRole = determineUserRole(verificationData.email, userData);
    userData.role = userRole;
    
    users.set(email, userData);

    // Delete verification data from memory
    pendingVerifications.delete(email);

    // Also delete from Firestore
    try {
      console.log('🗑️ Deleting OTP data from Firestore...');
      await db.collection('pendingVerifications').doc(email).delete();
      console.log('✅ OTP data deleted from Firestore successfully');
    } catch (firestoreError) {
      console.error('❌ Firestore delete failed:', firestoreError);
      console.log('⚠️ Data may still exist in Firestore');
    }

    // Generate JWT token with role
    const token = jwt.sign(
      { 
        uid: userId, 
        email: verificationData.email,
        name: verificationData.name,
        role: userRole
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log(`✅ User ${verificationData.email} verified successfully with role: ${userRole}`);

    console.log(`✅ User ${email} verified successfully`);

    res.json({
      success: true,
      message: 'Account verified successfully',
      token,
      user: {
        uid: userId,
        email: verificationData.email,
        name: verificationData.name,
        role: userRole
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

    // Check if verification data exists
    const verificationData = pendingVerifications.get(email);

    if (!verificationData) {
      return res.status(400).json({
        success: false,
        message: 'No pending verification found for this email'
      });
    }

    // Generate new OTP
    const newOtp = generateOTP();
    const newExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Update verification data in memory
    pendingVerifications.set(email, {
      ...verificationData,
      otp: newOtp,
      expiresAt: newExpiresAt,
      updatedAt: new Date()
    });

    // Also update in Firestore
    try {
      console.log('📝 Updating OTP data in Firestore...');
      await db.collection('pendingVerifications').doc(email).update({
        otp: newOtp,
        expiresAt: newExpiresAt,
        updatedAt: new Date()
      });
      console.log('✅ OTP data updated in Firestore successfully');
    } catch (firestoreError) {
      console.error('❌ Firestore update failed:', firestoreError);
      console.log('⚠️ Continuing with in-memory storage only');
    }

    // Send new OTP email automatically
    const emailResult = await sendOTPEmail(email, newOtp, verificationData.name);
    
    if (emailResult.success) {
      console.log(`📧 New OTP sent to ${email}`);
    } else {
      console.log(`⚠️ Email failed, new OTP logged to console: ${newOtp}`);
    }

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

    // Get user
    const user = users.get(email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate OTP for login
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Store login OTP
    loginOTPs.set(email, {
      email,
      otp,
      expiresAt,
      user: user,
      createdAt: new Date()
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, user.name);
    
    if (emailResult.success) {
      console.log(`📧 Login OTP sent to ${email}`);
    } else {
      console.log(`⚠️ Email failed, login OTP logged to console: ${otp}`);
    }

    res.json({
      success: true,
      message: 'OTP sent to your email for login verification',
      requiresOTP: true
    });

  } catch (error) {
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

    // Get login OTP data
    const loginData = loginOTPs.get(email);

    if (!loginData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired login OTP'
      });
    }

    // Check if OTP is correct
    if (loginData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired
    if (new Date() > loginData.expiresAt) {
      // Delete expired data
      loginOTPs.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Delete login OTP data
    loginOTPs.delete(email);

    // Get user role
    const userRole = loginData.user.role || determineUserRole(email, loginData.user);

    // Generate JWT token with role
    const token = jwt.sign(
      { 
        uid: loginData.user.uid, 
        email: loginData.user.email,
        name: loginData.user.name,
        role: userRole
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log(`✅ User ${email} logged in successfully with role: ${userRole}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        uid: loginData.user.uid,
        email: loginData.user.email,
        name: loginData.user.name,
        role: userRole
      }
    });

  } catch (error) {
    console.error('Login OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

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
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

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
    const user = users.get(email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Generate a simple reset link (in production, use Firebase Auth)
    const resetLink = `http://localhost:5173/reset-password?token=${Date.now()}&email=${encodeURIComponent(email)}`;
    
    console.log(`🔐 Password reset requested for: ${email}`);
    console.log(`🔗 Reset link: ${resetLink}`);

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetLink, user.name);
    
    if (emailResult.success) {
      console.log(`📧 Password reset email sent to ${email}`);
      res.json({
        success: true,
        message: 'Password reset link sent to your email address'
      });
    } else {
      console.log(`⚠️ Email failed, reset link: ${resetLink}`);
      res.json({
        success: true,
        message: 'Password reset link generated (check console for link)',
        resetLink: resetLink
      });
    }

  } catch (error) {
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
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, token, and new password are required'
      });
    }

    // Check if user exists
    const user = users.get(email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // In a real implementation, you'd validate the token
    // For now, we'll just check if it's a valid timestamp
    const tokenTime = parseInt(token);
    const now = Date.now();
    const tokenAge = now - tokenTime;
    
    // Token expires after 1 hour (3600000 ms)
    if (tokenAge > 3600000) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please request a new password reset.'
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    users.set(email, {
      ...user,
      hashedPassword: hashedPassword,
      updatedAt: new Date()
    });

    console.log(`✅ Password reset successful for: ${email}`);

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Enabled' : 'Disabled (using console fallback)'}`);
  console.log(`🧹 Auto-cleanup: Every 5 minutes`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/auth/`);
});
