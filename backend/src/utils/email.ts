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

const createOTPEmailTemplate = (name: string, otp: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CollegeMate - Email Verification</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #337ab7;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .logo {
          color: white;
          font-size: 32px;
          font-weight: bold;
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .tagline {
          color: white;
          font-size: 16px;
          margin: 5px 0 0 0;
          font-weight: normal;
        }
        .body {
          padding: 30px 20px;
          background-color: white;
        }
        .welcome {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin: 0 0 15px 0;
        }
        .intro-text {
          font-size: 16px;
          color: #333;
          line-height: 1.5;
          margin: 0 0 25px 0;
        }
        .otp-label {
          text-align: center;
          font-size: 16px;
          color: #333;
          margin: 0 0 15px 0;
        }
        .otp-box {
          background-color: #337ab7;
          color: white;
          font-size: 28px;
          font-weight: bold;
          text-align: center;
          padding: 15px 30px;
          border-radius: 8px;
          margin: 0 auto 25px auto;
          display: inline-block;
          letter-spacing: 3px;
          font-family: 'Courier New', monospace;
        }
        .disclaimer {
          font-size: 14px;
          color: #666;
          line-height: 1.4;
          margin: 0;
        }
        .footer {
          text-align: left;
          color: #999;
          font-size: 12px;
          margin-top: 20px;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0 10px;
          }
          .header {
            padding: 20px 15px;
          }
          .logo {
            font-size: 28px;
          }
          .body {
            padding: 20px 15px;
          }
          .welcome {
            font-size: 20px;
          }
          .otp-box {
            font-size: 24px;
            padding: 12px 25px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">CollegeMate</h1>
          <p class="tagline">Your College Journey Mate</p>
        </div>
        <div class="body">
          <h2 class="welcome">Welcome ${name}!</h2>
          <p class="intro-text">
            Thank you for signing up with CollegeMate! To complete your registration, 
            please verify your email address using the OTP below:
          </p>
          <p class="otp-label">Your verification code is:</p>
          <div class="otp-box">${otp}</div>
          <p class="disclaimer">
            This code will expire in 5 minutes. If you didn't request this verification, 
            please ignore this email.
          </p>
          <div class="footer">...</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendOTPEmail = async (email: string, otp: string, name: string): Promise<EmailResult> => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'CollegeMate - Verify Your Account',
      html: createOTPEmailTemplate(name, otp)
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
