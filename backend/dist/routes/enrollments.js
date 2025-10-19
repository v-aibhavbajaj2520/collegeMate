import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import { authenticateToken } from '../middleware/authenticate.js';
const router = Router();
const prisma = new PrismaClient();
// POST /api/enrollments - Create a new enrollment
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { fullName, phoneNumber, email, course, college, hasTakenMentorship } = req.body;
        // Validate required fields
        if (!fullName || !phoneNumber || !email || !course || !college || hasTakenMentorship === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['fullName', 'phoneNumber', 'email', 'course', 'college', 'hasTakenMentorship']
            });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        // Validate phone number format (basic validation)
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }
        // Check if user already has an enrollment
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
                userId: userId,
                email: email
            }
        });
        if (existingEnrollment) {
            return res.status(409).json({
                error: 'Enrollment already exists for this email',
                message: 'You have already submitted an enrollment with this email address.'
            });
        }
        // Create the enrollment
        const enrollment = await prisma.enrollment.create({
            data: {
                userId,
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                email: email.trim().toLowerCase(),
                course: course.trim(),
                college: college.trim(),
                hasTakenMentorship: Boolean(hasTakenMentorship)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });
        // Create a notification for the user
        await prisma.notification.create({
            data: {
                userId: userId,
                title: 'Enrollment Submitted Successfully',
                message: `Your enrollment for ${course} at ${college} has been submitted. Our team will contact you soon.`
            }
        });
        res.status(201).json({
            success: true,
            message: 'Enrollment submitted successfully',
            enrollment: {
                id: enrollment.id,
                fullName: enrollment.fullName,
                email: enrollment.email,
                course: enrollment.course,
                college: enrollment.college,
                hasTakenMentorship: enrollment.hasTakenMentorship,
                createdAt: enrollment.createdAt
            }
        });
    }
    catch (error) {
        console.error('Error creating enrollment:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create enrollment. Please try again later.'
        });
    }
});
// GET /api/enrollments - Get user's enrollments (for dashboard)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const enrollments = await prisma.enrollment.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                course: true,
                college: true,
                hasTakenMentorship: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({
            success: true,
            enrollments
        });
    }
    catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch enrollments. Please try again later.'
        });
    }
});
// GET /api/enrollments/:id - Get specific enrollment
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const enrollmentId = req.params.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!enrollmentId) {
            return res.status(400).json({ error: 'Enrollment ID is required' });
        }
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                id: enrollmentId,
                userId: userId
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                course: true,
                college: true,
                hasTakenMentorship: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!enrollment) {
            return res.status(404).json({
                error: 'Enrollment not found',
                message: 'The requested enrollment does not exist or you do not have permission to view it.'
            });
        }
        res.json({
            success: true,
            enrollment
        });
    }
    catch (error) {
        console.error('Error fetching enrollment:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch enrollment. Please try again later.'
        });
    }
});
export default router;
//# sourceMappingURL=enrollments.js.map