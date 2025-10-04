# Firebase Configuration Steps

## Step 1: Create Firebase Project (Web UI)

1. Open your browser and go to: https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. **Project name**: `coinshit` (or your preferred name)
4. **Google Analytics**: You can disable this for now (optional)
5. Click **"Create project"**
6. Wait for the project to be created (~30 seconds)

## Step 2: Register Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. **App nickname**: `Coinshit Web`
3. **Don't** check "Also set up Firebase Hosting"
4. Click **"Register app"**

You'll see a Firebase configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "coinshit-xxxxx.firebaseapp.com",
  projectId: "coinshit-xxxxx",
  storageBucket: "coinshit-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**COPY THIS CONFIG** - you'll need it in Step 6!

## Step 3: Enable Firestore Database

1. In the left sidebar, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. **Start in production mode** (we'll set custom rules next)
4. **Cloud Firestore location**: Choose closest to your users (e.g., `us-central1`, `europe-west1`)
5. Click **"Enable"**
6. Wait for database to be created (~1 minute)

### Set Firestore Security Rules

1. Click the **"Rules"** tab
2. Replace the content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entry} {
      allow read: if true;
      allow create: if true;
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

3. Click **"Publish"**

## Step 4: Enable Firebase Storage

1. In the left sidebar, click **"Build"** → **"Storage"**
2. Click **"Get started"**
3. **Start in production mode** (we'll set custom rules)
4. **Cloud Storage location**: Use the **same location** as Firestore
5. Click **"Done"**

### Set Storage Security Rules

1. Click the **"Rules"** tab
2. Replace the content with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /entries/{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

3. Click **"Publish"**

## Step 5: Create Firestore Indexes (Optional but Recommended)

1. Go to **Firestore Database** → **"Indexes"** tab
2. Click **"Create index"**
3. Configure:
   - Collection ID: `entries`
   - Field 1: `userName` (Ascending)
   - Field 2: `createdAt` (Descending)
   - Query scope: Collection
4. Click **"Create"**

*Note: If you skip this, Firebase will prompt you with a link when needed*

## Step 6: Update Your App Configuration

Now, take the Firebase config you copied in Step 2 and update your app:

1. Open `services/firebase.ts`
2. Replace the placeholder config with YOUR actual config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_PROJECT.firebaseapp.com",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

## Step 7: Test Your Configuration

Run the app:

```bash
npm run web
```

Try creating an entry:
1. Fill in name, product, date, amount
2. Click Submit
3. Check if it appears in the list below

### Verify in Firebase Console

1. Go to **Firestore Database** → **Data** tab
2. You should see the `entries` collection with your test entry
3. Go to **Storage** → **Files** tab
4. You should see uploaded images in the `entries/` folder (if you uploaded an image)

## Troubleshooting

### Error: "Permission denied"
- Check that you published the Firestore and Storage rules
- Verify rules allow `read: if true` and `create: if true`

### Error: "Firebase not initialized"
- Make sure you updated `services/firebase.ts` with your actual config
- Check for typos in the config object

### Error: "Missing or insufficient permissions"
- Your Firestore rules might not be published
- Try republishing the rules

### Images not uploading
- Check Storage rules are published
- Verify image size is under 5MB
- Check file type is an image

### Can't see entries in the list
- Check browser console for errors
- Verify Firestore has data (check Firebase Console)
- Make sure you clicked Submit after filling the form

## Security Warning

⚠️ **The current rules allow anyone to read and create entries without authentication.**

This is fine for development/demo, but for production you should:
1. Enable Firebase Authentication
2. Restrict rules to authenticated users
3. Add user ownership checks
4. Implement rate limiting

## Next Steps

Once Firebase is configured:
- ✅ Test all features (create, view, share)
- ✅ Deploy to Firebase Hosting (see DEPLOYMENT.md)
- ✅ Build mobile apps (see DEPLOYMENT.md)
- ✅ Set up custom domain
- ✅ Add analytics (optional)

---

**Configuration complete!** 🎉

If you need help with any step, check the detailed FIREBASE_SETUP.md guide.
