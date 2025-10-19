import express from 'express';
import cors from 'cors';
import { prisma } from './prisma.js';
import authRoutes from './routes/auth.js';
import notificationRoutes from './routes/notifications.js';
import enrollmentRoutes from './routes/enrollments.js';
import { cleanupExpiredOTPs } from './services/cleanup.js';
const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.json({ message: 'College Mate Backend Server is running!' }));
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/enrollments', enrollmentRoutes);
// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
});
// Start cleanup interval
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
// Graceful shutdown helpers
const shutdown = async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
export default app;
//# sourceMappingURL=app.js.map