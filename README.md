# Coinshit

**Spending BTC on shitty products (coinshit) is as bad as spending it on a shitcoin...**

A cross-platform mobile and web app that lets users enter past purchases and see how much money they would have saved (or lost) if they had bought Bitcoin instead.

## 🌐 Live Demo

**Try it now:** [https://coinshit-f6bc8.web.app](https://coinshit-f6bc8.web.app)

## Features

- 📱 **Cross-platform**: Runs on iOS, Android, and Web from a single codebase
- 💰 **Bitcoin Price Tracking**: Uses Binance (current) and CoinAPI (historical) for accurate BTC prices
- 🌍 **Multi-currency Support**: USD, EUR, GBP, CHF, JPY, CAD, AUD with live forex rates
- 📸 **Image Upload**: Upload product photos or auto-generate unique placeholder images
- 🔄 **Real-time Updates**: Live feed of all user entries with Firestore
- 🔍 **Advanced Filtering**: Multi-field search (name, product, currency, date) with debouncing
- 📤 **Share Links**: Share individual entries with deep linking
- 🎨 **Bitcoin-themed Design**: Dark theme with Bitcoin orange (#F7931A)
- ⚡ **Smart Caching**: Firestore-backed caching for BTC prices and exchange rates
- 🛡️ **Server-side Validation**: Cloud Functions for secure entry creation

## Tech Stack

- **Framework**: React Native + Expo (~54.0.12)
- **Routing**: Expo Router (file-based routing)
- **Backend**: Firebase (Firestore + Storage + Cloud Functions)
- **APIs**:
  - Binance (current BTC/USD price)
  - CoinAPI (historical BTC prices)
  - Frankfurter (forex exchange rates)
  - DiceBear (placeholder image generation)
- **Styling**: Inline styles with Bitcoin color palette
- **Language**: TypeScript (~5.9.2)
- **Deployment**: Firebase Hosting

## Project Structure

```
coinshit/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with navigation & error suppression
│   ├── index.tsx          # Home page (form + list with filter)
│   └── entry/[id].tsx     # Entry detail page
├── components/
│   ├── EntryForm.tsx      # Form to create entries (with validation)
│   ├── EntryList.tsx      # Real-time paginated list of entries
│   └── EntryCard.tsx      # Individual entry card
├── services/
│   ├── firebase.ts        # Firebase configuration & initialization
│   ├── bitcoin.ts         # BTC price APIs with Firestore caching
│   └── imageGen.ts        # DiceBear placeholder generation
├── functions/
│   └── index.js           # Cloud Functions (entry creation)
├── utils/
│   ├── types.ts           # TypeScript types
│   ├── calculations.ts    # Bitcoin savings calculations
│   └── currency.ts        # Currency detection
└── dist/                   # Build output (auto-generated)
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
      allow create: if true;  // Cloud Function uses Admin SDK
      allow update: if false;
      allow delete: if false;
    }
    match /btc_prices/{entry} {
      allow read: if true;
      allow create: if true;
      allow update: if false;
      allow delete: if false;
    }
    match /exchange_rates/{entry} {
      allow read: if true;
      allow create: if true;
      allow update: if false;
      allow delete: if false;
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
      allow write: if request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    match /placeholders/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

### 5. Deploy Cloud Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 6. Run the App

#### Web (development)
```bash
npm start
```

#### Production build & deploy
```bash
npx expo export --platform web
firebase deploy --only hosting
```

#### iOS (requires Mac + Xcode)
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Expo Go (easiest for testing on phone)
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

## API Information

### Binance API (Current BTC Price)
- **Endpoint**: `https://api.binance.com/api/v3/ticker/price`
- **Rate Limit**: Public, no auth required
- **Caching**: In-memory (5 minutes)

### CoinAPI (Historical BTC Prices)
- **Endpoint**: `https://api-historical.exrates.coinapi.io/v1`
- **API Key**: Required (see `services/bitcoin.ts`)
- **Caching**: Firestore (`btc_prices` collection, permanent)

### Frankfurter (Exchange Rates)
- **Endpoint**: `https://api.frankfurter.dev/v1`
- **Rate Limit**: Public, no auth required
- **Caching**: Firestore (`exchange_rates` collection, permanent)

### DiceBear (Placeholder Images)
- **Endpoint**: `https://api.dicebear.com/7.x/shapes/svg`
- **Rate Limit**: Public, no auth required
- **Caching**: Firebase Storage (`placeholders/` folder)

## Building for Production

### Web (Firebase Hosting)
```bash
npx expo export --platform web
firebase deploy --only hosting
```

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## Current Implementation Status

### ✅ Completed Features
- [x] Cross-platform support (Web, iOS, Android)
- [x] Real-time entry list with Firestore
- [x] Multi-field search with debouncing
- [x] Image upload with compression
- [x] Placeholder image generation and caching
- [x] BTC price tracking (current + historical)
- [x] Multi-currency support with live forex rates
- [x] Smart caching (Firestore + in-memory)
- [x] Server-side validation with Cloud Functions
- [x] Form validation with error messages
- [x] Date display in YYYY-MM-DD format
- [x] Responsive layout with optimized field sizes
- [x] Entry detail page with back navigation
- [x] Firebase Hosting deployment

### 🚧 Known Issues
- [ ] App Check disabled (reCAPTCHA token exchange 400 errors)
- [ ] Browser network logs show harmless 404/400 (normal behavior)

### 💡 Future Enhancements
- [ ] Re-enable App Check with reCAPTCHA Enterprise
- [ ] User authentication (Firebase Auth)
- [ ] Edit/delete own entries
- [ ] More cryptocurrencies (Ethereum, etc.)
- [ ] Charts and analytics
- [ ] Social features (likes, comments)
- [ ] Push notifications for price alerts
- [ ] AI-generated product images (DALL-E integration)

## License

MIT

## Documentation

- **[WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)** - Development workflow and best practices
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture overview
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions
- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Firebase configuration guide

## Repository

**GitHub**: [https://github.com/charona/coinshit](https://github.com/charona/coinshit)

## Contact

For questions or feedback, please open an issue on GitHub.
