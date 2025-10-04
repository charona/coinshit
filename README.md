# Coinshit

**What if you'd bought Bitcoin instead?**

A cross-platform mobile and web app that lets users enter past purchases and see how much money they would have saved (or lost) if they had bought Bitcoin instead.

## 🌐 Live Demo

**Try it now:** [https://coinshit-f6bc8.web.app](https://coinshit-f6bc8.web.app)

## Features

- 📱 **Cross-platform**: Runs on iOS, Android, and Web from a single codebase
- 💰 **Bitcoin Price Tracking**: Uses CoinGecko API for historical and current Bitcoin prices
- 🌍 **Multi-currency Support**: USD, EUR, GBP, CHF, JPY, CAD, AUD
- 📸 **Image Upload**: Upload product photos or auto-generate placeholder images
- 🔄 **Real-time Updates**: Live feed of all user entries
- 🔍 **User Filtering**: Type your name to see only your entries
- 📤 **Share Links**: Share individual entries with deep linking
- 🎨 **Bitcoin-themed Design**: Web 2.0 design with Bitcoin orange (#F7931A)

## Tech Stack

- **Framework**: React Native + Expo
- **Routing**: Expo Router (file-based routing)
- **Backend**: Firebase (Firestore + Storage)
- **APIs**: Binance (live BTC price), CoinAPI (historical prices), Frankfurter (forex rates)
- **Styling**: Inline styles with Bitcoin color palette
- **Languages**: TypeScript

## Project Structure

```
coinshit/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx          # Main page (form + list)
│   └── entry/[id].tsx     # Detail page for entries
├── components/
│   ├── EntryForm.tsx      # Form to create new entries
│   ├── EntryList.tsx      # Infinite scroll list of entries
│   └── EntryCard.tsx      # Individual entry card
├── services/
│   ├── firebase.ts        # Firebase configuration
│   ├── bitcoin.ts         # Bitcoin price fetching
│   └── imageGen.ts        # Placeholder image generation
└── utils/
    ├── types.ts           # TypeScript types
    ├── calculations.ts    # Bitcoin savings calculations
    └── currency.ts        # Currency detection
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Firebase account
- (Optional) iOS Simulator or Android Emulator

### 1. Install Dependencies

```bash
cd coinshit
npm install
```

### 2. Configure Firebase

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database
3. Enable Firebase Storage
4. Get your Firebase configuration (Project Settings > General > Your apps)
5. Update `services/firebase.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Set Up Firestore Security Rules

In Firebase Console > Firestore Database > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entry} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

### 4. Set Up Storage Security Rules

In Firebase Console > Storage > Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /entries/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

### 5. Run the App

#### Web
```bash
npm run web
```

#### iOS (requires Mac + Xcode)
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Expo Go (easiest for testing)
```bash
npm start
```
Then scan the QR code with Expo Go app on your phone.

## Deep Linking Configuration

The app supports deep linking for sharing entries:

- **iOS**: `coinshit://entry/[id]` or `https://coinshit.app/entry/[id]`
- **Android**: Same as above
- **Web**: `https://your-domain.com/entry/[id]`

To set up custom domain deep linking:
1. Update `app.json` with your domain
2. Set up universal links (iOS) and app links (Android)
3. Deploy web version and configure `.well-known/apple-app-site-association` and `.well-known/assetlinks.json`

## API Rate Limits

**CoinGecko Free Tier**:
- 10-50 calls/minute
- The app implements caching to minimize API calls

If you exceed rate limits, consider:
- Upgrading to CoinGecko Pro
- Implementing server-side caching
- Using alternative APIs (CoinAPI, CryptoCompare)

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### Web
```bash
expo export:web
```
Deploy the `web-build` folder to Firebase Hosting, Vercel, or Netlify.

## Future Enhancements

- [ ] AI-generated product images (DALL-E integration)
- [ ] User authentication (Firebase Auth)
- [ ] Edit/delete own entries
- [ ] More cryptocurrencies (Ethereum, etc.)
- [ ] Charts and analytics
- [ ] Social features (likes, comments)
- [ ] Push notifications for price alerts

## License

MIT

## Contact

For questions or feedback, please open an issue on GitHub.
