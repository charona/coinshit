# Quick Start Guide

Get Coinshit running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
cd coinshit
npm install
```

## Step 2: Set Up Firebase (2 min)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database** (production mode)
4. Enable **Firebase Storage**
5. Copy your Firebase config from Project Settings

## Step 3: Configure Firebase (1 min)

Edit `services/firebase.ts` and replace with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 4: Set Firestore Rules (1 min)

In Firebase Console > Firestore > Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entry} {
      allow read, create: if true;
    }
  }
}
```

Click **Publish**.

## Step 5: Set Storage Rules (30 sec)

In Firebase Console > Storage > Rules, paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /entries/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

Click **Publish**.

## Step 6: Run the App! (30 sec)

```bash
npm run web
```

The app will open at `http://localhost:8081`

## Testing

1. Enter your name (e.g., "John")
2. Enter a product (e.g., "iPhone")
3. Pick a date (e.g., 2020-01-01)
4. Enter amount (e.g., 1000)
5. Select currency (e.g., USD)
6. Click "Submit Entry"

You should see:
- Entry appears in the list below
- Shows how much you would have saved/lost
- Click the entry to see details
- Type your name in the form to filter only your entries

## Troubleshooting

**"Permission denied" error?**
- Check you published the Firestore/Storage rules
- Verify rules allow `read, create: if true`

**No Bitcoin price data?**
- CoinGecko API has rate limits (10-50 calls/min)
- Wait a minute and try again
- Check browser console for errors

**App won't start?**
- Make sure you ran `npm install`
- Check Node.js version (v16+ required)
- Clear cache: `npx expo start --clear`

## What's Next?

- **Deploy to web**: See `DEPLOYMENT.md`
- **Build for mobile**: Run `npm run ios` or `npm run android`
- **Customize design**: Edit colors in components
- **Add features**: See TODO list in README

## Need Help?

- Full docs: `README.md`
- Firebase setup: `FIREBASE_SETUP.md`
- Deployment: `DEPLOYMENT.md`

Happy coding! 🚀
