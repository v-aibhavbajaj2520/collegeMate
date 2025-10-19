import { OAuth2Client } from 'google-auth-library';
export const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback');
//# sourceMappingURL=google.js.map