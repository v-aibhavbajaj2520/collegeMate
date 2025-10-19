import express from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/authenticate.js';
const router = express.Router();
// GET /api/notifications - Get all notifications for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const authReq = req;
        const notifications = await prisma.notification.findMany({
            where: { userId: authReq.user.userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            notifications,
            unreadCount: notifications.filter(n => !n.isRead).length
        });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
// PATCH /api/notifications/:notificationId/read - Mark notification as read
router.patch('/:notificationId/read', authenticateToken, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const authReq = req;
        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: 'Notification ID is required'
            });
        }
        // Verify the notification belongs to the authenticated user
        const notification = await prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId: authReq.user.userId
            }
        });
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        const updatedNotification = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true, updatedAt: new Date() }
        });
        res.json({
            success: true,
            message: 'Notification marked as read',
            notification: updatedNotification
        });
    }
    catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
// DELETE /api/notifications/:notificationId - Delete notification
router.delete('/:notificationId', authenticateToken, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const authReq = req;
        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: 'Notification ID is required'
            });
        }
        // Verify the notification belongs to the authenticated user
        const notification = await prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId: authReq.user.userId
            }
        });
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        await prisma.notification.delete({
            where: { id: notificationId }
        });
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
export default router;
//# sourceMappingURL=notifications.js.map