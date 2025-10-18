# Firestore TTL Policy Setup

## Setting up TTL (Time-to-Live) Policy for pendingVerifications Collection

To automatically clean up expired OTP documents in Firestore, you need to set up a TTL policy. Follow these steps:

### 1. Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database

### 2. Create the Collection
1. Create a collection named `pendingVerifications`
2. Add a sample document with the following structure:
   ```json
   {
     "email": "test@example.com",
     "name": "Test User",
     "hashedPassword": "hashed_password_here",
     "otp": "123456",
     "expiresAt": "2024-01-01T00:00:00Z",
     "createdAt": "2024-01-01T00:00:00Z"
   }
   ```

### 3. Set up TTL Policy
1. In Firestore, go to the `pendingVerifications` collection
2. Click on the "Rules" tab
3. Add the following rule to enable TTL on the `expiresAt` field:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pendingVerifications/{document} {
      // Allow read/write access (adjust as needed for your security requirements)
      allow read, write: if true;
      
      // TTL policy - documents will be automatically deleted when expiresAt timestamp is reached
      // This is handled by Firestore's built-in TTL feature
    }
  }
}
```

### 4. Enable TTL in Firestore
1. Go to Firestore Database settings
2. Look for "Data retention" or "TTL" settings
3. Enable TTL for the `pendingVerifications` collection
4. Set the TTL field to `expiresAt`

### 5. Alternative: Manual Cleanup (if TTL is not available)
If TTL is not available in your Firebase plan, you can set up a Cloud Function to clean up expired documents:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.cleanupExpiredOTPs = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  const db = admin.firestore();
  const now = new Date();
  
  const expiredDocs = await db.collection('pendingVerifications')
    .where('expiresAt', '<', now)
    .get();
  
  const batch = db.batch();
  expiredDocs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`Cleaned up ${expiredDocs.size} expired OTP documents`);
});
```

### 6. Environment Variables Required
Make sure to set up these environment variables in your `.env` file:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

### 7. Testing the Setup
1. Start your backend server
2. Try the signup flow
3. Check Firestore to see if documents are created in `pendingVerifications`
4. Wait for 5 minutes and verify that expired documents are automatically deleted

## Security Notes
- The `pendingVerifications` collection contains sensitive data (hashed passwords)
- Consider adding additional security rules to restrict access
- Monitor the collection size to ensure TTL is working properly
- Consider implementing rate limiting for OTP requests
