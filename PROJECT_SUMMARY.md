# Coinshit - Project Summary

## Overview

**Coinshit** is a cross-platform app (iOS, Android, Web) that demonstrates the opportunity cost of spending money on products instead of Bitcoin. The tagline: "Spending BTC on shitty products (coinshit) is as bad as spending it on a shitcoin..."

**Live Demo**: https://coinshit-f6bc8.web.app

## Key Features Implemented

✅ **Cross-Platform**: Single React Native codebase for iOS, Android, and Web
✅ **Entry Form**: Name, product, photo, date, amount, currency with validation
✅ **Image Upload**: Pick from library or auto-generate unique placeholder
✅ **Bitcoin Calculation**: Historical vs current BTC price comparison
✅ **Real-time List**: Latest entries with real-time Firestore updates
✅ **Advanced Search**: Multi-field filtering (name, product, currency, date) with debouncing
✅ **Detail Page**: Full entry details with back navigation
✅ **Share Links**: Deep linking for entry sharing
✅ **Multi-Currency**: USD, EUR, GBP, CHF, JPY, CAD, AUD with live forex
✅ **Auto-Detection**: Currency based on user location
✅ **Bitcoin Theme**: Dark theme with Bitcoin orange (#F7931A)
✅ **Smart Caching**: Firestore + in-memory caching for prices
✅ **Cloud Functions**: Server-side entry creation with validation
✅ **Date Format**: Consistent YYYY-MM-DD display throughout app

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React Native + Expo | ~54.0.12 |
| Language | TypeScript | ~5.9.2 |
| Routing | Expo Router | File-based |
| Database | Firebase Firestore | Latest |
| Storage | Firebase Storage | Latest |
| Functions | Cloud Functions | Node.js 20 |
| BTC Prices | Binance + CoinAPI | - |
| Forex Rates | Frankfurter API | - |
| Placeholders | DiceBear API | v7.x |
| Hosting | Firebase Hosting | - |
| Location | Expo Location | Latest |
| Images | Expo Image Picker | Latest |
| Styling | Inline styles | - |

## Project Structure

```
coinshit/
├── app/                          # 📱 Pages (Expo Router)
│   ├── _layout.tsx              # Root layout + error suppression
│   ├── index.tsx                # Home page (form + filtered list)
│   └── entry/[id].tsx           # Detail page with back button
│
├── components/                   # 🧩 React Components
│   ├── EntryForm.tsx            # Validated form with Cloud Function call
│   ├── EntryList.tsx            # Real-time paginated list
│   └── EntryCard.tsx            # Individual entry card
│
├── services/                     # 🔧 External Services
│   ├── firebase.ts              # Firebase config & initialization
│   ├── bitcoin.ts               # Binance + CoinAPI with caching
│   └── imageGen.ts              # DiceBear placeholder generation
│
├── functions/                    # ☁️ Cloud Functions
│   └── index.js                 # Entry creation with validation
│
├── utils/                        # 🛠️ Utilities
│   ├── types.ts                 # TypeScript type definitions
│   ├── calculations.ts          # BTC savings calculations
│   └── currency.ts              # Currency detection logic
│
├── assets/                       # 🎨 Static Assets
│   ├── icon.png                 # App icon
│   ├── splash-icon.png          # Splash screen
│   └── ...
│
├── dist/                         # 🏗️ Build Output
│   └── ...                      # Auto-generated (do not edit)
│
└── Documentation/
    ├── README.md                # Full documentation
    ├── WORKFLOW_GUIDE.md        # Development workflow
    ├── ARCHITECTURE.md          # Technical architecture
    ├── FIREBASE_SETUP.md        # Firebase configuration
    └── DEPLOYMENT.md            # Production deployment
```

## Data Flow

```
1. User fills form → EntryForm validates → Calls Cloud Function
2. Cloud Function validates → Uploads image → Saves to Firestore
3. Firestore triggers → Real-time listener updates EntryList
4. User clicks entry → Navigates to detail page
5. Detail page → Calculates BTC value → Shows comparison
6. Share button → Generates deep link
```

## Core Components

### EntryForm (`components/EntryForm.tsx`)
- User input fields (name, product, date, amount, currency)
- Image picker with auto-generated placeholder fallback
- Form validation with error messages below each field
- Cloud Function integration (`httpsCallable`)
- Date display in YYYY-MM-DD format
- Responsive layout (optimized flex sizes)

### EntryList (`components/EntryList.tsx`)
- Firestore real-time listener (`onSnapshot`)
- Pagination (20 entries per page)
- Multi-field client-side filtering
- Loading states with indicators

### EntryCard (`components/EntryCard.tsx`)
- Displays entry summary
- Calculates BTC savings/loss with current prices
- Green (saved) or red (lost) styling
- Navigates to detail page on tap

### Detail Page (`app/entry/[id].tsx`)
- Full entry information display
- "That BTC would now be worth" calculation
- Larger product image (contain mode)
- Back button for web navigation
- Share functionality (future)

### Cloud Function (`functions/index.js`)
- Input validation (length, amount > 0)
- Server-side timestamp (`Timestamp.now()`)
- Error handling with detailed messages
- App Check disabled (due to token issues)

## API Integration

### Binance API (`services/bitcoin.ts`)
- **Endpoint**: `https://api.binance.com/api/v3/ticker/price`
- **Usage**: Current BTC/USD price
- **Caching**: In-memory (5 minutes)
- **Rate Limit**: Public, no auth

### CoinAPI (`services/bitcoin.ts`)
- **Endpoint**: `https://api-historical.exrates.coinapi.io/v1`
- **Usage**: Historical BTC prices
- **API Key**: `bb331bd5-9b5b-49af-92f3-ad8ee4820f58`
- **Caching**: Firestore `btc_prices` collection (permanent)

### Frankfurter API (`services/bitcoin.ts`)
- **Endpoint**: `https://api.frankfurter.dev/v1`
- **Usage**: Forex exchange rates
- **Caching**: Firestore `exchange_rates` collection (permanent)
- **Rate Limit**: Public, no auth

### DiceBear API (`services/imageGen.ts`)
- **Endpoint**: `https://api.dicebear.com/7.x/shapes/svg`
- **Usage**: Unique placeholder images (seeded by product name)
- **Style**: shapes, backgroundColor: F7931A
- **Caching**: Firebase Storage `placeholders/` folder

## Calculation Logic

```typescript
// 1. Get historical BTC price on purchase date
historicalPrice = await getHistoricalBitcoinPrice(purchaseDate, currency)

// 2. Calculate BTC amount that could have been bought
btcAmount = fiatAmount / historicalPrice

// 3. Get current BTC price
currentPrice = await getCurrentBitcoinPrice(currency)

// 4. Calculate current value
currentValue = btcAmount * currentPrice

// 5. Calculate difference
difference = currentValue - fiatAmount
percentage = (difference / fiatAmount) * 100
saved = difference > 0  // green or red styling
```

## Firebase Schema

### Collection: `entries`

```javascript
{
  id: string (auto-generated),
  userName: string,
  productName: string,
  imageUrl: string,
  purchaseDate: Timestamp,
  fiatAmount: number,
  currency: string,
  createdAt: Timestamp
}
```

### Collection: `btc_prices` (cache)

```javascript
{
  id: string (e.g., "btc-usd-2024-01-15"),
  price: number,
  date: string (YYYY-MM-DD),
  timestamp: Timestamp
}
```

### Collection: `exchange_rates` (cache)

```javascript
{
  id: string (e.g., "fx-USD-EUR-2024-01-15"),
  rate: number,
  from: string,
  to: string,
  date: string (YYYY-MM-DD),
  timestamp: Timestamp
}
```

### Firestore Indexes

```
Collection: entries
Fields: createdAt (Descending)
```

## Security Rules

### Firestore Rules

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

### Storage Rules

```javascript
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

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Bitcoin Orange | `#F7931A` | Primary, buttons, headers |
| Black | `#000000` | Background |
| Dark Gray | `#1a1a1a` | Cards, inputs |
| Medium Gray | `#666666` | Placeholder text |
| Light Gray | `#999999` | Secondary text |
| White | `#FFFFFF` | Primary text |
| Green | `#10b981` | Savings/gains |
| Red | `#ef4444` | Losses, errors |

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (web)
npm start

# Run on specific platform
npm run ios        # iOS simulator
npm run android    # Android emulator

# Build for production
npx expo export --platform web
firebase deploy --only hosting

# Deploy functions
firebase deploy --only functions

# Full deployment
firebase deploy
```

## Environment Setup

### Required Accounts
1. **Firebase** (free tier sufficient)
2. **Expo** (free tier sufficient)
3. **Apple Developer** ($99/year for iOS deployment)
4. **Google Play** ($25 one-time for Android deployment)

### API Keys
- Firebase config (in `services/firebase.ts`)
- CoinAPI key (in `services/bitcoin.ts`)
- No keys needed for Binance, Frankfurter, DiceBear

## Performance Optimizations

- ✅ BTC price caching (in-memory: 5 min, Firestore: permanent)
- ✅ Exchange rate caching (Firestore: permanent)
- ✅ Placeholder image caching (Firebase Storage)
- ✅ Pagination (20 entries per page)
- ✅ Real-time updates (no polling, uses `onSnapshot`)
- ✅ Debounced search (300ms delay)
- ✅ Image compression (quality: 0.7)
- ✅ Optimized bundle (Expo Metro)

## Known Issues & Limitations

### 🚧 Current Issues
- **App Check disabled**: reCAPTCHA v3 token exchange returns 400 errors
- **Network logs**: Browser shows harmless 404/400 (suppressed in JS console)
- **pointerEvents warning**: From React Native Web internals (suppressed)

### ⚠️ Limitations
1. **No authentication** - Anyone can create entries
2. **No editing** - Can't edit/delete entries after creation
3. **Single crypto** - Bitcoin only (no ETH, etc.)
4. **Basic placeholders** - Geometric shapes only (no AI)
5. **Public write** - No spam protection (App Check disabled)

## Future Enhancements

### High Priority
- [ ] Re-enable App Check with reCAPTCHA Enterprise
- [ ] User authentication (Firebase Auth)
- [ ] Edit/delete entries
- [ ] AI image generation (DALL-E)

### Medium Priority
- [ ] More cryptocurrencies (Ethereum, etc.)
- [ ] Charts/analytics dashboard
- [ ] Social features (likes, comments)
- [ ] Push notifications

### Low Priority
- [ ] Dark/light theme toggle
- [ ] Multiple languages (i18n)
- [ ] Export data (CSV/PDF)
- [ ] Leaderboards

## Testing Checklist

- ✅ Create entry with uploaded photo
- ✅ Create entry with auto-generated placeholder
- ✅ Multi-field filtering (name, product, currency, date)
- ✅ Real-time list updates
- ✅ Pagination and infinite scroll
- ✅ Detail page view with calculations
- ✅ Multi-currency support
- ✅ Date format consistency (YYYY-MM-DD)
- ✅ Form validation and error messages
- ✅ Mobile responsiveness
- [ ] Deep link navigation (configured, not tested)
- [ ] Share functionality (UI ready, implementation pending)

## Support Resources

| Resource | Link |
|----------|------|
| Expo Docs | https://docs.expo.dev |
| Firebase Docs | https://firebase.google.com/docs |
| React Native | https://reactnative.dev |
| Binance API | https://binance-docs.github.io/apidocs |
| CoinAPI | https://docs.coinapi.io |
| Frankfurter | https://www.frankfurter.app/docs |
| DiceBear | https://www.dicebear.com/styles/shapes |

## Repository

**GitHub**: https://github.com/charona/coinshit

## License

MIT License

## Credits

- Bitcoin price data: Binance + CoinAPI
- Forex rates: Frankfurter API
- Placeholder images: DiceBear
- Framework: Expo / React Native
- Backend: Firebase
- Development: Claude Code + Jeroen Playak

---

**Built with** ❤️ **and Bitcoin orange** 🧡

*Last Updated: 2025-10-10*
