export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export declare const sendOTPEmail: (email: string, otp: string, name: string) => Promise<EmailResult>;
export declare const sendPasswordResetEmail: (email: string, resetLink: string, name: string) => Promise<EmailResult>;
//# sourceMappingURL=email.d.ts.map