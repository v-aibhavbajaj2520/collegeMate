import { prisma } from '../prisma.js';
export const createNotification = async (data) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId: data.userId,
                title: data.title,
                message: data.message,
                isRead: false
            }
        });
        console.log(`📢 Notification created for user ${data.userId}: ${data.title}`);
        return notification;
    }
    catch (error) {
        console.error('Error creating notification:', error);
        // Don't throw error to avoid breaking the main flow
        return null;
    }
};
export const createWelcomeNotification = async (userId) => {
    return createNotification({
        userId,
        title: 'Welcome Back!',
        message: "It's great to see you again. Check out what's new in your dashboard."
    });
};
//# sourceMappingURL=notifications.js.map