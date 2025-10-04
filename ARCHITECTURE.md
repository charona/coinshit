# Coinshit - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER DEVICES                          │
├─────────────┬─────────────┬─────────────────────────────────┤
│   iOS App   │ Android App │        Web Browser              │
│  (Native)   │  (Native)   │     (Progressive Web App)       │
└──────┬──────┴──────┬──────┴──────────┬──────────────────────┘
       │             │                 │
       └─────────────┴─────────────────┘
                     │
                     │ HTTPS
                     ▼
       ┌─────────────────────────────┐
       │     EXPO / REACT NATIVE     │
       │      (Runtime Layer)        │
       └─────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │Firebase│  │CoinGecko│ │ Expo  │
    │        │  │   API   │  │Services│
    └────────┘  └────────┘  └────────┘
```

## Component Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     app/index.tsx                        │
│                    (Main Page)                           │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐     │
│  │            Header & Branding                   │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │           EntryForm Component                  │     │
│  │  ┌──────────────────────────────────────────┐ │     │
│  │  │ Name Input (triggers filtering)          │ │     │
│  │  │ Product Input                            │ │     │
│  │  │ Image Picker                             │ │     │
│  │  │ Date Picker                              │ │     │
│  │  │ Amount & Currency Selector              │ │     │
│  │  │ Submit Button                            │ │     │
│  │  └──────────────────────────────────────────┘ │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │           EntryList Component                  │     │
│  │  ┌──────────────────────────────────────────┐ │     │
│  │  │  EntryCard (entry 1)                     │ │     │
│  │  ├──────────────────────────────────────────┤ │     │
│  │  │  EntryCard (entry 2)                     │ │     │
│  │  ├──────────────────────────────────────────┤ │     │
│  │  │  EntryCard (entry 3)                     │ │     │
│  │  ├──────────────────────────────────────────┤ │     │
│  │  │  ...                                     │ │     │
│  │  ├──────────────────────────────────────────┤ │     │
│  │  │  Loading Indicator (infinite scroll)    │ │     │
│  │  └──────────────────────────────────────────┘ │     │
│  └────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│    USER     │
└──────┬──────┘
       │ 1. Fills form
       ▼
┌─────────────────┐
│   EntryForm     │
│   Component     │
└──────┬──────────┘
       │ 2. Upload image
       ▼
┌─────────────────┐
│ Firebase Storage│◄───── Image File
└──────┬──────────┘
       │ 3. Returns URL
       ▼
┌─────────────────┐
│   EntryForm     │
│   (continues)   │
└──────┬──────────┘
       │ 4. Create document
       ▼
┌─────────────────┐
│    Firestore    │◄───── Entry Data + Image URL
└──────┬──────────┘
       │ 5. Real-time update
       ▼
┌─────────────────┐
│   EntryList     │
│  (onSnapshot)   │
└──────┬──────────┘
       │ 6. Fetch new entries
       ▼
┌─────────────────┐
│   EntryCard     │
│  (for each)     │
└──────┬──────────┘
       │ 7. Calculate BTC value
       ▼
┌─────────────────┐
│ Bitcoin Service │
│ (CoinGecko API) │
└──────┬──────────┘
       │ 8. Returns prices
       ▼
┌─────────────────┐
│  Calculations   │
│    Service      │
└──────┬──────────┘
       │ 9. Display result
       ▼
┌─────────────────┐
│   EntryCard     │
│   (Updated)     │
└─────────────────┘
```

## Service Layer Architecture

```
┌───────────────────────────────────────────────────────────┐
│                  SERVICES LAYER                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Firebase Service                      │    │
│  │  ┌───────────────────────────────────────────┐ │    │
│  │  │  initializeApp()                          │ │    │
│  │  │  getFirestore() → db                      │ │    │
│  │  │  getStorage() → storage                   │ │    │
│  │  └───────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │         Bitcoin Price Service                   │    │
│  │  ┌───────────────────────────────────────────┐ │    │
│  │  │  getCurrentBitcoinPrice(currency)         │ │    │
│  │  │  getHistoricalBitcoinPrice(date, curr)    │ │    │
│  │  │  Cache Management (5 min TTL)             │ │    │
│  │  └───────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │        Image Generation Service                 │    │
│  │  ┌───────────────────────────────────────────┐ │    │
│  │  │  generatePlaceholderImage(productName)    │ │    │
│  │  │  hashString() → seed                      │ │    │
│  │  │  DiceBear API integration                 │ │    │
│  │  └───────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────┘
```

## Utility Layer Architecture

```
┌───────────────────────────────────────────────────────────┐
│                   UTILS LAYER                             │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │            Type Definitions                     │    │
│  │  ┌───────────────────────────────────────────┐ │    │
│  │  │  Entry (base type)                        │ │    │
│  │  │  CalculatedEntry (with BTC data)          │ │    │
│  │  │  Currency types                           │ │    │
│  │  │  Currency symbols map                     │ │    │
│  │  └───────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │         Calculation Utilities                   │    │
│  │  ┌───────────────────────────────────────────┐ │    │
│  │  │  calculateEntryValue(entry)               │ │    │
│  │  │  formatCurrency(amount, currency)         │ │    │
│  │  │  Percentage calculations                  │ │    │
│  │  └───────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Currency Utilities                    │    │
│  │  ┌───────────────────────────────────────────┐ │    │
│  │  │  detectUserCurrency()                     │ │    │
│  │  │  getCurrencyByCountry(code)               │ │    │
│  │  │  Location permissions                     │ │    │
│  │  └───────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────┘
```

## Routing Architecture (Expo Router)

```
File System                          URL Route
────────────                         ─────────

app/
├── _layout.tsx                      /
│   └── Navigation wrapper           (Root layout)
│
├── index.tsx                        /
│   └── Main page                    (Home)
│
└── entry/
    └── [id].tsx                     /entry/:id
        └── Detail page              (Dynamic route)
```

## State Management

```
┌─────────────────────────────────────────────────────┐
│              COMPONENT STATE                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  EntryForm Component                                │
│  ┌───────────────────────────────────────────────┐ │
│  │  useState: userName                           │ │
│  │  useState: productName                        │ │
│  │  useState: imageUri                           │ │
│  │  useState: purchaseDate                       │ │
│  │  useState: fiatAmount                         │ │
│  │  useState: currency                           │ │
│  │  useState: loading                            │ │
│  │  useState: showCurrencyPicker                 │ │
│  │  useEffect: detectUserCurrency()              │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  EntryList Component                                │
│  ┌───────────────────────────────────────────────┐ │
│  │  useState: entries[]                          │ │
│  │  useState: loading                            │ │
│  │  useState: loadingMore                        │ │
│  │  useState: lastDoc (pagination)               │ │
│  │  useState: hasMore                            │ │
│  │  useEffect: onSnapshot (real-time)            │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  EntryCard Component                                │
│  ┌───────────────────────────────────────────────┐ │
│  │  useState: calculated (CalculatedEntry)       │ │
│  │  useState: loading                            │ │
│  │  useState: error                              │ │
│  │  useEffect: calculateEntryValue()             │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

No global state management (Redux, MobX, etc.) needed
All state is component-local or from Firestore real-time
```

## Caching Strategy

```
┌─────────────────────────────────────────────────────┐
│              CACHING LAYERS                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Bitcoin Price Cache (In-Memory)                    │
│  ┌───────────────────────────────────────────────┐ │
│  │  Map<string, {price, timestamp}>              │ │
│  │  Key: "current-{currency}"                    │ │
│  │  Key: "{date}-{currency}"                     │ │
│  │  TTL: 5 minutes                               │ │
│  │  Scope: Per session                           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Firestore Real-time (Firebase SDK)                │
│  ┌───────────────────────────────────────────────┐ │
│  │  onSnapshot() maintains local cache           │ │
│  │  Automatic synchronization                    │ │
│  │  Offline persistence (optional)               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Image Storage (Firebase Storage + CDN)             │
│  ┌───────────────────────────────────────────────┐ │
│  │  Cached via URLs                              │ │
│  │  Browser cache headers                        │ │
│  │  CDN edge caching                             │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Network Layer (HTTPS)                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  All connections encrypted                      │   │
│  │  SSL/TLS certificates                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Firestore Security Rules                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  allow read: if true                            │   │
│  │  allow create: if true                          │   │
│  │  allow update: if false (no edits)              │   │
│  │  allow delete: if false (no deletes)            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Storage Security Rules                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  allow read: if true                            │   │
│  │  allow write: if image && size < 5MB            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Input Validation                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Client-side form validation                    │   │
│  │  Type checking (TypeScript)                     │   │
│  │  Required field checks                          │   │
│  │  Numeric validations                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Rate Limiting                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  CoinGecko: Built-in (10-50/min)                │   │
│  │  Firebase: Quota-based                          │   │
│  │  Client-side throttling (price cache)           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

⚠️ NOTE: Current setup has NO AUTHENTICATION
For production, add Firebase Auth + restrictive rules
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  DEPLOYMENT FLOW                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Source Code (GitHub)                                   │
│         │                                               │
│         ├──────────────┬──────────────┬──────────────┐  │
│         │              │              │              │  │
│         ▼              ▼              ▼              ▼  │
│    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│    │  iOS   │    │Android │    │  Web   │    │ Assets │
│    │ Build  │    │ Build  │    │ Build  │    │        │
│    └────┬───┘    └────┬───┘    └────┬───┘    └────┬───┘
│         │              │              │              │  │
│         ▼              ▼              ▼              ▼  │
│    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│    │  App   │    │ Google │    │Firebase│    │Firebase│
│    │ Store  │    │  Play  │    │Hosting │    │Storage │
│    └────────┘    └────────┘    └────────┘    └────────┘
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Performance Optimization Strategy

```
┌─────────────────────────────────────────────────────────┐
│              PERFORMANCE OPTIMIZATIONS                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. API Calls                                           │
│     ✓ Price caching (5 min)                             │
│     ✓ Batch requests where possible                     │
│     ✓ Lazy loading                                      │
│                                                         │
│  2. Data Loading                                        │
│     ✓ Pagination (20 items/page)                        │
│     ✓ Infinite scroll                                   │
│     ✓ Real-time updates (no polling)                    │
│                                                         │
│  3. Images                                              │
│     ✓ Compressed uploads (0.7 quality)                  │
│     ✓ Thumbnail sizes in list                           │
│     ✓ Lazy image loading                                │
│     ✓ CDN delivery                                      │
│                                                         │
│  4. Code Splitting                                      │
│     ✓ Route-based (Expo Router)                         │
│     ✓ Component lazy loading                            │
│     ✓ Tree shaking                                      │
│                                                         │
│  5. Rendering                                           │
│     ✓ FlatList for large lists                          │
│     ✓ Memoization opportunities                         │
│     ✓ Avoid unnecessary re-renders                      │
└─────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Try Operation    │
└──────┬───────────┘
       │
       ├─── Success ──────────────────┐
       │                              │
       └─── Error ────┐               │
                      │               │
                      ▼               │
              ┌───────────────┐       │
              │ Catch Block   │       │
              └───────┬───────┘       │
                      │               │
                      ├─ Log to console
                      │               │
                      ├─ Show Alert   │
                      │               │
                      └─ Set error    │
                         state        │
                                      │
                      ┌───────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ Update UI     │
              └───────────────┘
```

## Scalability Considerations

```
Current Limits:
- Firestore free tier: 50K reads, 20K writes/day
- Storage: 5GB
- CoinGecko: 10-50 calls/min

Scale to 10K users:
- Upgrade Firebase to Blaze plan
- Implement server-side caching (Cloud Functions)
- Consider CoinGecko Pro
- Add CDN for images

Scale to 100K users:
- Dedicated backend server
- Database sharding
- Load balancing
- Redis cache layer
- Premium API plans
```

## Technology Decisions Rationale

| Decision | Rationale |
|----------|-----------|
| **Expo** | Cross-platform from single codebase, easier deployment |
| **Firebase** | Real-time capabilities, easy setup, generous free tier |
| **TypeScript** | Type safety, better developer experience |
| **Expo Router** | File-based routing, native navigation feel |
| **CoinGecko** | Free tier, reliable, no API key needed |
| **Inline Styles** | Simple, no extra dependencies, platform-consistent |
| **No Auth (yet)** | Faster MVP, can add later without major refactor |

## Future Architecture Enhancements

1. **Add Redis Cache Layer**
   - Cache Bitcoin prices server-side
   - Reduce API calls by 90%

2. **Implement Cloud Functions**
   - Background image processing
   - Scheduled price updates
   - Content moderation

3. **Add GraphQL Layer**
   - More efficient queries
   - Reduce over-fetching

4. **Microservices**
   - Separate image service
   - Separate price service
   - Better scalability

5. **CDN Integration**
   - Cloudflare for images
   - Edge caching
   - Better global performance
