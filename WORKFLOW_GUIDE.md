# Coinshit Development Workflow Guide

This guide documents the development workflow and practices established for the Coinshit app. Follow these conventions to maintain consistency.

## Tech Stack

- **Frontend**: React Native with Expo (~54.0.12)
- **Language**: TypeScript (~5.9.2)
- **Backend**: Firebase (Firestore, Storage, Functions)
- **Hosting**: Firebase Hosting
- **Repository**: https://github.com/charona/coinshit.git
- **Live URL**: https://coinshit-f6bc8.web.app

## Project Structure

```
coinshit/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx          # Home page (list view)
│   └── entry/[id].tsx     # Entry detail page
├── components/            # Reusable components
│   ├── EntryCard.tsx
│   ├── EntryForm.tsx
│   └── EntryList.tsx
├── services/              # API and Firebase services
│   ├── bitcoin.ts         # BTC price APIs
│   ├── firebase.ts        # Firebase config
│   └── imageGen.ts        # Placeholder images
├── utils/                 # Utilities and types
├── functions/             # Cloud Functions
│   └── index.js          # Entry creation function
└── dist/                  # Build output
```

## Development Workflow

### 1. Making Changes

**Always follow this order:**
1. Read existing files to understand current implementation
2. Make changes to source files (NOT dist/)
3. Test locally first
4. Deploy to Firebase

**Important Rules:**
- NEVER edit files in `dist/` - they're auto-generated
- ALWAYS prefer editing existing files over creating new ones
- NEVER create documentation files unless explicitly requested
- Keep code concise and minimal

### 2. Testing Locally

Multiple dev servers should run simultaneously:
```bash
npm start  # Run in background
```

Check for errors in browser console (filter by "Errors" only).

### 3. Deployment

**Standard deployment** (after making changes):
```bash
firebase deploy --only hosting
```

**Deploy functions** (if Cloud Functions changed):
```bash
firebase deploy --only functions
```

**Full deployment** (everything):
```bash
firebase deploy
```

### 4. Committing to Git

**Only commit when explicitly requested by user.**

Standard commit workflow:
```bash
# Check status
git status
git diff

# Stage and commit
git add .
git commit -m "Brief description

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push
git push
```

## Code Style & Conventions

### Date Formatting
- **Always** display dates as `YYYY-MM-DD` throughout the app
- Use `date.toISOString().split('T')[0]` for formatting

### Form Fields (Web)
- Name and Product Name: equal width (flex: 1)
- Date and Amount: wider (flex: 1.5)
- Currency and Photo: narrower (flex: 0.7)
- Use shortened placeholders: "Name *", "Product *", "Date *"

### Images
- Uploaded photos: stored in `entries/` in Firebase Storage
- Placeholder images: generated via DiceBear API
- Placeholder caching: `placeholders/{seed}.svg` in Firebase Storage

### Error Handling
- Suppress harmless network errors (404 cache checks, 400 Firestore terminations)
- Only show actual application errors to users
- Log important errors, suppress noise

## Firebase Configuration

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

### Cloud Functions
- Location: `functions/index.js`
- Runtime: Node.js 20
- Entry creation uses `httpsCallable` from client
- **App Check**: Currently disabled due to token exchange issues
- Functions use `Timestamp.now()` for server-side timestamps

## API Keys & Services

### CoinAPI (Historical BTC Prices)
- Key: `bb331bd5-9b5b-49af-92f3-ad8ee4820f58`
- Endpoint: `https://api-historical.exrates.coinapi.io/v1`
- Cached in Firestore (`btc_prices` collection)

### Binance (Current BTC Price)
- Endpoint: `https://api.binance.com/api/v3/ticker/price`
- No auth required
- In-memory cache: 5 minutes

### Frankfurter (Exchange Rates)
- Endpoint: `https://api.frankfurter.dev/v1`
- No auth required
- Cached in Firestore (`exchange_rates` collection)

### DiceBear (Placeholder Images)
- Endpoint: `https://api.dicebear.com/7.x/shapes/svg`
- No auth required
- Style: shapes, backgroundColor: F7931A

## Known Issues & Workarounds

### Console Errors (Harmless)
- **404 errors**: Normal when checking if cached files exist
- **400 errors with TYPE=terminate**: Firestore WebSocket cleanup
- These are suppressed in the code for developer console

### Deprecation Warnings
- `pointerEvents` warning: From React Native Web internals, suppressed in code
- `ImagePicker.MediaTypeOptions`: Updated to use array format `['images']`

### App Check (Disabled)
- reCAPTCHA v3 integration had 400 errors on token exchange
- Currently disabled to allow app to function
- Site key: `6LdTJt8rAAAAAGkMAIUpE_BtAA9cox_X1tL68CuV`
- Consider migrating to reCAPTCHA Enterprise if re-enabling

## Common Tasks

### Adding a new entry field
1. Update `Entry` type in `utils/types.ts`
2. Add field to `EntryForm.tsx`
3. Update Firestore write in Cloud Function
4. Update `EntryCard.tsx` and detail view if needed

### Changing date display format
- Search for `.toLocaleDateString()` and replace with `.toISOString().split('T')[0]`
- Consistent across: EntryCard, EntryList, EntryForm, entry detail page

### Updating BTC price source
- Edit `services/bitcoin.ts`
- Update API endpoint and parsing logic
- Maintain caching structure

### Adding validation
- Form validation in `EntryForm.tsx` (lines 83-119)
- Server validation in `functions/index.js` (lines 18-31)
- Display errors below form fields

## Performance Optimizations

### Caching Strategy
- **BTC prices**: Firestore (permanent)
- **Exchange rates**: Firestore (permanent)
- **Placeholder images**: Firebase Storage (permanent)
- **Current BTC price**: In-memory (5 min TTL)

### Image Optimization
- User uploads: Auto-compressed by ImagePicker (quality: 0.7)
- Aspect ratio: 4:3
- Max size: 5MB (enforced by Storage rules)

### List Performance
- Pagination: 20 entries per page
- Real-time updates via `onSnapshot`
- Client-side filtering (multi-field search)

## Troubleshooting

### Build fails
```bash
# Clean and rebuild
rm -rf dist/ .expo/
npm start
```

### Deploy fails
```bash
# Check Firebase login
firebase login

# Verify project
firebase projects:list
firebase use coinshit-f6bc8
```

### Console errors persist
- Check browser DevTools settings
- Ensure "Log XMLHttpRequests" is disabled
- Filter console to show only "Errors"

## Git Conventions

### Commit Messages
- Keep first line concise (1-2 sentences)
- Focus on "why" not "what"
- Always include Claude Code attribution
- Use imperative mood: "Add feature" not "Added feature"

### Branch Strategy
- Main branch: `main` (or `master`)
- No feature branches currently used
- Direct commits to main after testing

## Contact & Resources

- **Firebase Console**: https://console.firebase.google.com/project/coinshit-f6bc8
- **GitHub Repo**: https://github.com/charona/coinshit
- **Live App**: https://coinshit-f6bc8.web.app
- **Git User**: Jeroen Playak (playak@users.noreply.github.com)

## Quick Reference

### Most Common Commands
```bash
# Development
npm start                          # Start dev server

# Deployment
firebase deploy --only hosting     # Deploy web app
firebase deploy --only functions   # Deploy Cloud Functions

# Git
git status                        # Check changes
git add .                         # Stage all
git commit -m "message"          # Commit
git push                         # Push to GitHub

# Firebase
firebase login                    # Login
firebase projects:list           # List projects
firebase firestore:rules         # Manage Firestore rules
```

### File Shortcuts
- Forms: `components/EntryForm.tsx`
- List: `components/EntryList.tsx`
- BTC prices: `services/bitcoin.ts`
- Firebase: `services/firebase.ts`
- Types: `utils/types.ts`
- Cloud Functions: `functions/index.js`

---

**Last Updated**: 2025-10-10
**Maintained By**: Claude Code + Jeroen Playak
