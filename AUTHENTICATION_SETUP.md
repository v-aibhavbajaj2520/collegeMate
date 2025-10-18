# CollegeMate Authentication System Setup Guide

## Overview
This guide will help you set up a complete authentication system for CollegeMate with Firebase backend, email verification, and modern React frontend.

## Features Implemented
- ✅ Multi-step signup with OTP verification
- ✅ Login with email/password
- ✅ Forgot password functionality
- ✅ OTP resend with cooldown
- ✅ Modern UI with Tailwind CSS
- ✅ Firebase Authentication integration
- ✅ Email service with Nodemailer
- ✅ JWT token management
- ✅ Responsive design

## Frontend Setup

### 1. Install Dependencies
The frontend already has all required dependencies. If you need to install them:

```bash
cd frontend
npm install
```

### 2. Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# MongoDB (Optional)
MONGODB_URI=your-mongodb-connection-string
```

### 3. Firebase Setup

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication and Firestore Database

#### Step 2: Enable Authentication Methods
1. Go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Enable Google and GitHub providers (optional)

#### Step 3: Create Service Account
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values and add them to your `.env` file

#### Step 4: Set up Firestore
1. Go to Firestore Database
2. Create a collection named `pendingVerifications`
3. Set up TTL policy (see `backend/FIRESTORE_SETUP.md` for details)

### 4. Email Setup (Gmail)

#### Option 1: App Password (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings
3. Security > 2-Step Verification > App passwords
4. Generate an app password for "Mail"
5. Use this password in `EMAIL_PASS`

#### Option 2: Less Secure Apps (Not Recommended)
1. Turn on "Allow less secure apps" in Gmail settings
2. Use your regular Gmail password

### 5. Start Backend Server
```bash
cd backend
npm start
```

The backend will be available at `http://localhost:5000`

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
Creates a new user account and sends OTP for verification.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email address"
}
```

#### POST /api/auth/verify-otp
Verifies the OTP and creates the user account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account verified successfully",
  "token": "jwt-token-here",
  "user": {
    "uid": "firebase-uid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### POST /api/auth/resend-otp
Resends OTP to the user's email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### POST /api/auth/login
Logs in an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123!"
}
```

#### POST /api/auth/forgot-password
Sends password reset link to user's email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

## Frontend Pages

### Signup Page (`/signup`)
- Multi-step form with user details and OTP verification
- Client-side validation for email format and password strength
- OTP resend functionality with 60-second cooldown
- Modern glass morphism design

### Login Page (`/login`)
- Email and password login
- Forgot password functionality
- OAuth buttons (Google/GitHub) - ready for implementation
- Responsive design

## Security Features

1. **Password Hashing**: Uses bcrypt with 12 salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **OTP Expiration**: 5-minute expiry for OTPs
4. **Input Validation**: Both client and server-side validation
5. **Rate Limiting**: OTP resend cooldown
6. **Secure Email**: Professional email templates

## Testing the System

### 1. Test Signup Flow
1. Go to `http://localhost:5173/signup`
2. Fill in the signup form
3. Check your email for OTP
4. Enter OTP to verify account

### 2. Test Login Flow
1. Go to `http://localhost:5173/login`
2. Use verified credentials to login
3. Check browser console for JWT token

### 3. Test Forgot Password
1. Go to login page
2. Click "Forgot Password?"
3. Enter email and check for reset link

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Check your service account credentials
   - Ensure Firebase project ID is correct
   - Verify private key format (with \n for newlines)

2. **Email Not Sending**
   - Check Gmail app password
   - Verify EMAIL_USER and EMAIL_PASS in .env
   - Check Gmail security settings

3. **OTP Not Working**
   - Check Firestore collection exists
   - Verify TTL policy is set up
   - Check server logs for errors

4. **Frontend Not Loading**
   - Ensure backend is running on port 5000
   - Check CORS settings
   - Verify API endpoints are accessible

### Debug Mode
To enable debug logging, add this to your backend `.env`:
```env
DEBUG=true
```

## Next Steps

1. **OAuth Integration**: Implement Google and GitHub OAuth
2. **User Dashboard**: Create user profile and dashboard pages
3. **Protected Routes**: Add route protection based on authentication
4. **Session Management**: Implement proper session handling
5. **Email Templates**: Customize email templates further
6. **Rate Limiting**: Add API rate limiting
7. **Logging**: Implement comprehensive logging system

## Support

If you encounter any issues:
1. Check the console logs for errors
2. Verify all environment variables are set correctly
3. Ensure Firebase project is properly configured
4. Check email service configuration

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── SignupPage.tsx
│   │   └── LoginPage.tsx
│   ├── components/
│   │   └── Navbar.tsx (updated)
│   └── App.tsx (updated)

backend/
├── config/
│   ├── firebase.js
│   └── email.js
├── server.js (updated)
├── env.example
└── FIRESTORE_SETUP.md
```

This authentication system provides a solid foundation for your CollegeMate application with modern security practices and user experience.
