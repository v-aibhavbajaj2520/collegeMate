import bcrypt from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../utils/email.js';
import { generateOTP, generateToken } from '../utils/helpers.js';
import { googleClient } from '../utils/google.js';
import { createWelcomeNotification } from '../utils/notifications.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
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
		const user = await prisma.user.findUnique({ 
			where: { id: req.user.userId }
		});
		if (!user) return res.status(404).json({ success: false, message: 'User not found' });
		
		// Select only needed fields (to avoid Prisma type errors until client is regenerated)
		const userResponse = {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			isVerified: user.isVerified,
			googleId: user.googleId,
			photo: (user as any).photo || null,
			age: (user as any).age || null,
			phone: (user as any).phone || null,
			school10th: (user as any).school10th || null,
			school12th: (user as any).school12th || null,
			collegesInterested: (user as any).collegesInterested || [],
			coursesInterested: (user as any).coursesInterested || [],
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		};
		
		res.json({ success: true, user: userResponse });
	} catch (error) {
		console.error('Get user error:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
	try {
		requireUser(req);
		const { userId: id } = req.user;
		
		console.log('Update profile request body:', req.body);
		console.log('Update profile file:', req.file);
		
		let { name, age, phone, school10th, school12th, collegesInterested, coursesInterested } = req.body;
		
		// Trim string fields and convert empty strings to null
		if (name !== undefined && typeof name === 'string') {
			name = name.trim();
			if (name === '') name = undefined;
		}
		if (phone !== undefined && typeof phone === 'string') {
			phone = phone.trim();
			if (phone === '') phone = null;
		}
		if (school10th !== undefined && typeof school10th === 'string') {
			school10th = school10th.trim();
			if (school10th === '') school10th = null;
		}
		if (school12th !== undefined && typeof school12th === 'string') {
			school12th = school12th.trim();
			if (school12th === '') school12th = null;
		}
		
		// Get existing user to check for photo deletion
		const existingUser = await prisma.user.findUnique({ where: { id } });
		if (!existingUser) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}

		let photoUrl = (existingUser as any).photo;

		// Handle photo upload if provided
		if (req.file) {
			try {
				photoUrl = await uploadToCloudinary(req.file, 'collegeMate/profiles');
				console.log('Photo uploaded successfully:', photoUrl);
			} catch (uploadError: any) {
				console.error('Photo upload error:', uploadError);
				const errorMessage = uploadError?.message || 'Failed to upload photo';
				// Check if it's a configuration error
				if (errorMessage.includes('not configured')) {
					return res.status(500).json({ 
						success: false, 
						message: 'Photo upload is not configured. Please contact administrator.',
						details: 'Cloudinary configuration is missing'
					});
				}
				return res.status(500).json({ 
					success: false, 
					message: `Failed to upload photo: ${errorMessage}` 
				});
			}
		}

		// Handle array fields - FormData sends arrays as JSON strings
		// Always ensure arrays are valid arrays (never null or undefined)
		try {
			if (collegesInterested !== undefined && collegesInterested !== null && collegesInterested !== '') {
				if (typeof collegesInterested === 'string') {
					// If it's a string (from FormData), try to parse it as JSON
					try {
						const parsed = JSON.parse(collegesInterested);
						collegesInterested = Array.isArray(parsed) ? parsed.filter((id: any) => id !== null && id !== undefined && String(id).trim() !== '') : [];
					} catch (parseError) {
						console.warn('Failed to parse collegesInterested as JSON:', parseError);
						console.warn('Raw collegesInterested value:', collegesInterested);
						// If not valid JSON, treat as empty array
						collegesInterested = [];
					}
				} else if (Array.isArray(collegesInterested)) {
					// Already an array, ensure it's valid
					collegesInterested = collegesInterested.filter((id: any) => id !== null && id !== undefined && String(id).trim() !== '');
				} else {
					collegesInterested = [];
				}
			} else {
				collegesInterested = [];
			}
		} catch (error) {
			console.error('Error processing collegesInterested:', error);
			collegesInterested = [];
		}

		try {
			if (coursesInterested !== undefined && coursesInterested !== null && coursesInterested !== '') {
				if (typeof coursesInterested === 'string') {
					try {
						const parsed = JSON.parse(coursesInterested);
						coursesInterested = Array.isArray(parsed) ? parsed.filter((id: any) => id !== null && id !== undefined && String(id).trim() !== '') : [];
					} catch (parseError) {
						console.warn('Failed to parse coursesInterested as JSON:', parseError);
						console.warn('Raw coursesInterested value:', coursesInterested);
						// If not valid JSON, treat as empty array
						coursesInterested = [];
					}
				} else if (Array.isArray(coursesInterested)) {
					// Already an array, ensure it's valid
					coursesInterested = coursesInterested.filter((id: any) => id !== null && id !== undefined && String(id).trim() !== '');
				} else {
					coursesInterested = [];
				}
			} else {
				coursesInterested = [];
			}
		} catch (error) {
			console.error('Error processing coursesInterested:', error);
			coursesInterested = [];
		}

		console.log('Parsed collegesInterested:', collegesInterested);
		console.log('Parsed coursesInterested:', coursesInterested);

		// Build update data
		const updateData: any = {};
		// Don't manually set updatedAt - Prisma's @updatedAt handles it automatically

		// Name is required, validate it
		if (!name || typeof name !== 'string' || name.trim() === '') {
			return res.status(400).json({ 
				success: false, 
				message: 'Name is required and cannot be empty' 
			});
		}
		updateData.name = name.trim();
		if (age !== undefined && age !== null && age !== '') {
			const ageNum = parseInt(age.toString());
			updateData.age = isNaN(ageNum) ? null : ageNum;
		} else if (age === '' || age === null) {
			updateData.age = null;
		}
		if (phone !== undefined) {
			updateData.phone = phone && phone.trim() !== '' ? phone.trim() : null;
		}
		if (school10th !== undefined) {
			updateData.school10th = school10th && school10th.trim() !== '' ? school10th.trim() : null;
		}
		if (school12th !== undefined) {
			updateData.school12th = school12th && school12th.trim() !== '' ? school12th.trim() : null;
		}
		// Always set arrays (even if empty) - ensure they're proper arrays of strings
		updateData.collegesInterested = Array.isArray(collegesInterested) 
			? collegesInterested.map(id => String(id).trim()).filter(id => id !== '')
			: [];
		updateData.coursesInterested = Array.isArray(coursesInterested) 
			? coursesInterested.map(id => String(id).trim()).filter(id => id !== '')
			: [];
		if (photoUrl !== undefined && photoUrl !== null) {
			updateData.photo = photoUrl;
		}

		console.log('Update data:', JSON.stringify(updateData, null, 2));

		// Validate that array fields are actually arrays
		if (updateData.collegesInterested && !Array.isArray(updateData.collegesInterested)) {
			return res.status(400).json({ 
				success: false, 
				message: 'collegesInterested must be an array' 
			});
		}
		if (updateData.coursesInterested && !Array.isArray(updateData.coursesInterested)) {
			return res.status(400).json({ 
				success: false, 
				message: 'coursesInterested must be an array' 
			});
		}

		// Validate age if provided
		if (updateData.age !== undefined && updateData.age !== null) {
			if (typeof updateData.age !== 'number' || updateData.age < 1 || updateData.age > 150) {
				return res.status(400).json({ 
					success: false, 
					message: 'Age must be a number between 1 and 150' 
				});
			}
		}

		try {
			console.log('Attempting Prisma update with data:', JSON.stringify(updateData, null, 2));
			
			// Ensure arrays are properly formatted before update
			if (updateData.collegesInterested !== undefined) {
				updateData.collegesInterested = Array.isArray(updateData.collegesInterested) 
					? updateData.collegesInterested 
					: [];
			}
			if (updateData.coursesInterested !== undefined) {
				updateData.coursesInterested = Array.isArray(updateData.coursesInterested) 
					? updateData.coursesInterested 
					: [];
			}
			
			const updatedUser = await prisma.user.update({ 
				where: { id }, 
				data: updateData
			});
			console.log('Prisma update successful');
			
			// Fetch the updated user with all fields
			const userWithFields = await prisma.user.findUnique({
				where: { id },
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
					isVerified: true,
					photo: true,
					age: true,
					phone: true,
					school10th: true,
					school12th: true,
					collegesInterested: true,
					coursesInterested: true,
				}
			});
			
			if (!userWithFields) {
				return res.status(404).json({ 
					success: false, 
					message: 'User not found after update' 
				});
			}
			
			// Build response - ensure all fields are properly typed
			const userResponse = {
				id: userWithFields.id,
				email: userWithFields.email,
				name: userWithFields.name,
				role: userWithFields.role,
				isVerified: userWithFields.isVerified,
				photo: userWithFields.photo || null,
				age: userWithFields.age || null,
				phone: userWithFields.phone || null,
				school10th: userWithFields.school10th || null,
				school12th: userWithFields.school12th || null,
				collegesInterested: Array.isArray(userWithFields.collegesInterested) 
					? userWithFields.collegesInterested 
					: [],
				coursesInterested: Array.isArray(userWithFields.coursesInterested) 
					? userWithFields.coursesInterested 
					: []
			};
			
			res.json({ success: true, message: 'Profile updated successfully', user: userResponse });
		} catch (prismaError: any) {
			console.error('Prisma update error:', prismaError);
			console.error('Prisma error code:', prismaError.code);
			console.error('Prisma error message:', prismaError.message);
			console.error('Prisma meta:', prismaError.meta);
			console.error('Update data that failed:', JSON.stringify(updateData, null, 2));
			
			// Handle specific Prisma errors
			if (prismaError.code === 'P2002') {
				return res.status(400).json({ 
					success: false, 
					message: 'A unique constraint failed. Please check your input.',
					field: prismaError.meta?.target?.[0]
				});
			}
			if (prismaError.code === 'P2025') {
				return res.status(404).json({ 
					success: false, 
					message: 'User not found' 
				});
			}
			// Re-throw to be caught by outer catch
			throw prismaError;
		}
	} catch (error: any) {
		console.error('Update profile error:', error);
		console.error('Error stack:', error.stack);
		console.error('Error details:', JSON.stringify(error, null, 2));
		
		// Provide more specific error messages
		let errorMessage = 'Internal server error';
		if (error.message) {
			errorMessage = error.message;
		} else if (error.code) {
			errorMessage = `Database error: ${error.code}`;
		}
		
		res.status(500).json({ 
			success: false, 
			message: errorMessage,
			...(process.env.NODE_ENV === 'development' && { 
				error: error.message,
				stack: error.stack 
			})
		});
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

