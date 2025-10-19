import { prisma } from '../prisma.js';

export const cleanupExpiredOTPs = async () => {
  try {
    const result = await prisma.user.updateMany({
      where: { otpExpiresAt: { lt: new Date() } },
      data: { otp: null, otpExpiresAt: null }
    });
    if (result.count > 0) console.log(`🧹 Cleaned up ${result.count} expired OTPs`);
  } catch (error) {
    console.error('Error cleaning up OTPs:', error);
  }
};
