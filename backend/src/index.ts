import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Enabled' : 'Disabled (using console fallback)'}`);
  console.log(`🧹 Auto-cleanup: Every 5 minutes`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/auth/`);
  console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Enabled' : 'Disabled'}`);
});

export default app;