# Firebase Storage Setup Instructions

## Issue
Firebase Storage is rejecting uploads because of authentication and security rules.

## Solution

### 1. Firebase Storage Rules
You need to update your Firebase Storage rules to allow uploads. Go to:
1. Firebase Console → Storage → Rules
2. Replace the default rules with:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow write access to products folder for any authenticated user
    match /products/{fileName} {
      allow write: if true; // For development - CHANGE THIS FOR PRODUCTION
    }
    
    // For production, use this instead:
    // match /products/{fileName} {
    //   allow write: if request.auth != null 
    //     && request.resource.size < 5 * 1024 * 1024 // 5MB limit
    //     && request.resource.contentType.matches('image/.*');
    // }
  }
}
```

### 2. Alternative: Temporarily Allow All Access (DEVELOPMENT ONLY)
For quick testing, you can temporarily allow all access:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING: This is not secure for production! Only use for development.**

### 3. Service Account Authentication (Production)
For production deployment, you should use Firebase Admin SDK with service account:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Download the JSON file
4. Set environment variables:
   ```
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
   ```

### 4. Current Configuration
The current setup uses Firebase Client SDK which requires:
- Proper Storage Rules (see step 1)
- OR anonymous authentication enabled in Firebase Auth

### 5. Test Upload
After updating the rules:
1. Restart your server
2. Try uploading an image through the admin panel
3. Check browser network tab for any errors
4. Check server logs for detailed error messages

### 6. Troubleshooting
If you still get errors:
1. Check Firebase Console → Storage → Usage to see if files are being created
2. Verify your Firebase project ID matches in .env
3. Check browser console for CORS errors
4. Ensure your domain is added to Firebase Auth authorized domains