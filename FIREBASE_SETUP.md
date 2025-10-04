# Firebase Setup Guide

This guide will help you set up Firebase for the Coinshit app.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `coinshit` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 2: Register Your App

### For Web
1. In Firebase Console, click the web icon `</>`
2. Register app with nickname: `Coinshit Web`
3. Don't check "Firebase Hosting" yet
4. Copy the Firebase config object

### For iOS
1. Click the iOS icon
2. Bundle ID: `com.coinshit.app` (must match `app.json`)
3. Download `GoogleService-Info.plist`
4. Follow Expo's Firebase setup instructions

### For Android
1. Click the Android icon
2. Package name: `com.coinshit.app` (must match `app.json`)
3. Download `google-services.json`
4. Follow Expo's Firebase setup instructions

## Step 3: Enable Firestore

1. In Firebase Console, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Choose production mode
4. Select a location (choose closest to your users)
5. Click "Enable"

### Set Up Firestore Rules

Go to the "Rules" tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read entries
    match /entries/{entry} {
      allow read: if true;
      allow create: if true;
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

Click "Publish"

## Step 4: Enable Firebase Storage

1. In Firebase Console, go to "Build" > "Storage"
2. Click "Get started"
3. Use production mode
4. Use the same location as Firestore
5. Click "Done"

### Set Up Storage Rules

Go to the "Rules" tab and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /entries/{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 5 * 1024 * 1024 // Max 5MB
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

Click "Publish"

## Step 5: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Find your web app
4. Copy the `firebaseConfig` object

It should look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 6: Update Your Code

Open `services/firebase.ts` and replace the placeholder config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // Replace with your actual values
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 7: Test Your Setup

1. Run the app: `npm start`
2. Try creating an entry
3. Check Firebase Console:
   - Go to Firestore Database to see the new document
   - Go to Storage to see the uploaded image

## Firestore Data Structure

The app creates documents in the `entries` collection with this structure:

```javascript
{
  userName: string,
  productName: string,
  imageUrl: string,
  purchaseDate: Timestamp,
  fiatAmount: number,
  currency: string,
  createdAt: Timestamp
}
```

## Indexes

If you get an error about missing indexes, Firebase will provide a link to create them automatically. Click the link and Firebase will set up the required composite indexes.

Common index needed:
- Collection: `entries`
- Fields: `userName` (Ascending), `createdAt` (Descending)
- Query scope: Collection

## Security Considerations

**Current rules allow anyone to read and create entries** (no authentication required).

For production, consider:

1. **Rate Limiting**: Use Firebase App Check to prevent abuse
2. **Authentication**: Require users to sign in
3. **Validation**: Add more restrictive rules
4. **Moderation**: Implement Cloud Functions to review content

### Example with Authentication:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entry} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
                            && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Cost Estimation

Firebase has a generous free tier:

**Firestore Free Tier (per day)**:
- 50,000 document reads
- 20,000 document writes
- 20,000 document deletes
- 1 GiB stored

**Storage Free Tier**:
- 5 GB stored
- 1 GB/day downloaded

**Typical usage for 1000 daily active users**:
- ~2,000 writes (entries)
- ~50,000 reads (browsing)
- ~500 MB storage (images)

This should fit within the free tier initially. Monitor usage in Firebase Console.

## Troubleshooting

### "Permission denied" error
- Check your Firestore/Storage security rules
- Make sure rules are published
- Verify you're using the correct collection name (`entries`)

### Images not uploading
- Check Storage rules allow image uploads
- Verify file size is under 5MB
- Make sure Storage is enabled

### Can't fetch entries
- Check Firestore has the `entries` collection
- Verify you've created at least one entry
- Check browser/app console for errors

### API rate limits
- CoinGecko free tier: 10-50 calls/minute
- The app caches prices for 5 minutes
- Consider upgrading if you exceed limits

## Next Steps

Once Firebase is set up:
1. Test the app thoroughly
2. Set up Firebase Hosting for the web version
3. Configure custom domain
4. Set up Firebase Analytics (optional)
5. Enable crash reporting
