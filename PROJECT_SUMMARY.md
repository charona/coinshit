# Coinshit - Project Summary

## Overview

**Coinshit** is a cross-platform app (iOS, Android, Web) that lets users enter past purchases and calculate how much they would have saved or lost if they had bought Bitcoin instead.

## Key Features Implemented

✅ **Cross-Platform**: Single React Native codebase for iOS, Android, and Web
✅ **Entry Form**: Name, product, photo, date, amount, currency
✅ **Image Upload**: Pick from library or auto-generate placeholder
✅ **Bitcoin Calculation**: Historical vs current BTC price comparison
✅ **Real-time List**: Latest entries with infinite scroll
✅ **User Filtering**: Type name to see only your entries
✅ **Detail Page**: Full entry details with larger image
✅ **Share Links**: Deep linking for entry sharing
✅ **Multi-Currency**: USD, EUR, GBP, CHF, JPY, CAD, AUD
✅ **Auto-Detection**: Currency based on user location
✅ **Bitcoin Theme**: Orange (#F7931A) color palette

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo |
| Language | TypeScript |
| Routing | Expo Router (file-based) |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| API | CoinGecko (Bitcoin prices) |
| Location | Expo Location |
| Images | Expo Image Picker |
| Styling | Inline styles |

## Project Structure

```
coinshit/
├── app/                          # 📱 Pages (Expo Router)
│   ├── _layout.tsx              # Root layout with navigation
│   ├── index.tsx                # Main page (form + list)
│   └── entry/[id].tsx           # Detail page for entries
│
├── components/                   # 🧩 React Components
│   ├── EntryForm.tsx            # Form to create entries
│   ├── EntryList.tsx            # Infinite scroll list
│   └── EntryCard.tsx            # Individual entry card
│
├── services/                     # 🔧 External Services
│   ├── firebase.ts              # Firebase config & initialization
│   ├── bitcoin.ts               # CoinGecko API integration
│   └── imageGen.ts              # Placeholder image generation
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
└── Documentation/
    ├── README.md                # Full documentation
    ├── QUICKSTART.md            # 5-minute setup guide
    ├── FIREBASE_SETUP.md        # Firebase configuration
    └── DEPLOYMENT.md            # Production deployment
```

## Data Flow

```
1. User fills form → EntryForm component
2. Image uploaded → Firebase Storage
3. Entry saved → Firestore Database
4. List refreshes → Real-time listener
5. Click entry → Detail page
6. Share → Deep link generated
```

## Core Components

### EntryForm (`components/EntryForm.tsx`)
- User input fields (name, product, date, amount, currency)
- Image picker with fallback to placeholder
- Real-time name filtering
- Firebase integration
- Form validation

### EntryList (`components/EntryList.tsx`)
- Firestore real-time listener
- Infinite scroll pagination (20 per page)
- User filtering
- Loading states

### EntryCard (`components/EntryCard.tsx`)
- Displays entry summary
- Calculates BTC savings/loss
- Green (saved) or red (lost) styling
- Navigates to detail page

### Detail Page (`app/entry/[id].tsx`)
- Full entry information
- Larger product image
- BTC calculation details
- Share functionality
- Full-screen image modal

## API Integration

### CoinGecko API (`services/bitcoin.ts`)
- **Current Price**: `/api/v3/simple/price`
- **Historical Price**: `/api/v3/coins/bitcoin/history`
- **Caching**: 5-minute cache to avoid rate limits
- **Rate Limit**: 10-50 calls/minute (free tier)

### Firebase (`services/firebase.ts`)
- **Firestore**: Document database for entries
- **Storage**: Image hosting
- **Real-time**: Live updates when entries added

## Calculation Logic

```typescript
// 1. Get historical BTC price on purchase date
historicalPrice = getBitcoinPrice(purchaseDate, currency)

// 2. Calculate BTC amount that could have been bought
btcAmount = fiatAmount / historicalPrice

// 3. Get current BTC price
currentPrice = getCurrentBitcoinPrice(currency)

// 4. Calculate current value
currentValue = btcAmount * currentPrice

// 5. Calculate difference
difference = currentValue - fiatAmount
percentage = (difference / fiatAmount) * 100
saved = difference > 0
```

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Bitcoin Orange | `#F7931A` | Primary, buttons, headers |
| Black | `#000000` | Background |
| Dark Gray | `#1a1a1a` | Cards, inputs |
| Light Gray | `#999999` | Secondary text |
| White | `#FFFFFF` | Primary text |
| Green | `#10b981` | Savings/gains |
| Red | `#ef4444` | Losses |

## User Flow

1. **Landing Page**
   - See app tagline
   - View entry form at top
   - Scroll through latest entries

2. **Create Entry**
   - Enter name → triggers filtering
   - Add product details
   - Upload photo (optional)
   - Select date & amount
   - Submit → appears in list

3. **Browse Entries**
   - See latest 20 entries
   - Scroll for more (infinite)
   - Filter by typing name
   - Click to view details

4. **View Details**
   - See full entry info
   - View larger image
   - Check BTC calculations
   - Share with friends

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

### Indexes

```
Collection: entries
Fields: userName (Ascending), createdAt (Descending)
```

## Deep Linking

### URL Schemes
- **iOS**: `coinshit://entry/{id}`
- **Android**: `coinshit://entry/{id}`
- **Web**: `https://coinshit.app/entry/{id}`

### Implementation
- Configured in `app.json`
- Universal links for iOS
- App links for Android
- Share button in detail page

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run web        # Web browser
npm run ios        # iOS simulator
npm run android    # Android emulator

# Build for production
npx expo build:web
eas build --platform ios
eas build --platform android
```

## Environment Setup

### Required Accounts
1. **Firebase** (free tier sufficient)
2. **Expo** (free tier sufficient)
3. **Apple Developer** ($99/year for iOS deployment)
4. **Google Play** ($25 one-time for Android deployment)

### API Keys Needed
- Firebase config (free)
- CoinGecko API (no key needed for free tier)

## Security Considerations

⚠️ **Current setup is for development/demo**

Production recommendations:
- [ ] Add Firebase Authentication
- [ ] Implement rate limiting
- [ ] Add content moderation
- [ ] Use environment variables for keys
- [ ] Set up Firebase App Check
- [ ] Implement user data privacy

## Performance Optimizations

- ✅ Price caching (5 minutes)
- ✅ Infinite scroll pagination
- ✅ Real-time updates (no polling)
- ✅ Optimized images (placeholder fallback)
- 🔄 TODO: Image compression
- 🔄 TODO: Server-side rendering
- 🔄 TODO: CDN for images

## Known Limitations

1. **No authentication** - Anyone can create entries
2. **No editing** - Can't edit/delete entries
3. **Basic image generation** - Placeholder only (no AI)
4. **Rate limits** - CoinGecko free tier (10-50/min)
5. **Single crypto** - Bitcoin only (no ETH, etc.)

## Future Enhancements

### High Priority
- [ ] User authentication
- [ ] Edit/delete entries
- [ ] AI image generation (DALL-E)
- [ ] More cryptocurrencies

### Medium Priority
- [ ] Charts/analytics
- [ ] Social features (likes, comments)
- [ ] Push notifications
- [ ] Email sharing

### Low Priority
- [ ] Dark/light theme toggle
- [ ] Multiple languages
- [ ] Export data (CSV/PDF)
- [ ] Leaderboards

## Testing Checklist

- [ ] Create entry with photo
- [ ] Create entry without photo (placeholder)
- [ ] Filter by username
- [ ] Infinite scroll loading
- [ ] Detail page view
- [ ] Share functionality
- [ ] Multi-currency support
- [ ] Location-based currency
- [ ] Deep link navigation
- [ ] Mobile responsiveness

## Support Resources

| Resource | Link |
|----------|------|
| Expo Docs | https://docs.expo.dev |
| Firebase Docs | https://firebase.google.com/docs |
| React Native | https://reactnative.dev |
| CoinGecko API | https://www.coingecko.com/api |

## License

MIT License - See LICENSE file

## Credits

- Bitcoin price data: CoinGecko
- Placeholder images: DiceBear
- Framework: Expo / React Native
- Backend: Firebase

---

**Built with** ❤️ **and Bitcoin orange** 🧡
