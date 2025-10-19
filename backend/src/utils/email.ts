import nodemailer from 'nodemailer';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

export const sendOTPEmail = async (email: string, otp: string, name: string): Promise<EmailResult> => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'CollegeMate - Verify Your Account',
      html: `...OTP_TEMPLATE... ${otp}`
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    console.log(`\n🔐 OTP for ${email}: ${otp}\n`);
    return { success: false, error: (error as Error).message };
  }
};

export const sendPasswordResetEmail = async (email: string, resetLink: string, name: string): Promise<EmailResult> => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'CollegeMate - Reset Your Password',
      html: `...RESET_TEMPLATE... ${resetLink}`
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, error: (error as Error).message };
  }
};
