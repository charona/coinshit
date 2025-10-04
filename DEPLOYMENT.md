# Deployment Guide

This guide covers how to deploy Coinshit to production for iOS, Android, and Web.

## Prerequisites

- Completed Firebase setup (see `FIREBASE_SETUP.md`)
- Apple Developer account ($99/year for iOS)
- Google Play Developer account ($25 one-time for Android)
- Domain name (optional, for custom web domain)

## Web Deployment

### Option 1: Firebase Hosting (Recommended)

1. **Install Firebase CLI**:
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Initialize Firebase Hosting**:
```bash
firebase init hosting
```
- Select your Firebase project
- Set public directory: `web-build`
- Configure as single-page app: Yes
- Don't overwrite `index.html`

4. **Build the web app**:
```bash
npx expo export:web
```

5. **Deploy**:
```bash
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

### Option 2: Vercel

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Build**:
```bash
npx expo export:web
```

3. **Deploy**:
```bash
cd web-build
vercel --prod
```

### Option 3: Netlify

1. **Build**:
```bash
npx expo export:web
```

2. **Deploy via Netlify CLI or drag-and-drop**:
   - Go to [netlify.com](https://netlify.com)
   - Drag the `web-build` folder
   - Or use: `netlify deploy --prod --dir=web-build`

### Custom Domain Setup

1. **Purchase domain** (e.g., coinshit.app)
2. **In Firebase Hosting** (or your provider):
   - Add custom domain
   - Follow DNS configuration instructions
3. **Update `app.json`**:
   - Change `coinshit.app` to your actual domain
4. **Set up universal links** (see below)

## iOS Deployment

### Development Build

1. **Install EAS CLI**:
```bash
npm install -g eas-cli
```

2. **Login to Expo**:
```bash
eas login
```

3. **Configure EAS Build**:
```bash
eas build:configure
```

4. **Create development build**:
```bash
eas build --platform ios --profile development
```

### Production Build

1. **Update app credentials in `app.json`**
2. **Build for App Store**:
```bash
eas build --platform ios --profile production
```

3. **Submit to App Store**:
```bash
eas submit --platform ios
```

### App Store Listing

Create assets:
- **App Icon**: 1024x1024px (use Bitcoin orange theme)
- **Screenshots**: iPhone and iPad sizes
- **Description**: Use README content as base
- **Keywords**: bitcoin, cryptocurrency, savings, investment tracker
- **Category**: Finance

## Android Deployment

### Development Build

```bash
eas build --platform android --profile development
```

### Production Build

1. **Build AAB for Play Store**:
```bash
eas build --platform android --profile production
```

2. **Submit to Google Play**:
```bash
eas submit --platform android
```

### Google Play Listing

Create assets:
- **App Icon**: 512x512px
- **Feature Graphic**: 1024x500px
- **Screenshots**: Phone and tablet sizes
- **Short Description**: ~80 characters
- **Full Description**: Use README content
- **Category**: Finance

## Universal Links / Deep Links

### iOS Universal Links

1. **Create Apple App Site Association file**:
Create `.well-known/apple-app-site-association` (no extension):

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.coinshit.app",
        "paths": ["/entry/*"]
      }
    ]
  }
}
```

2. **Host on your domain**:
   - Upload to: `https://coinshit.app/.well-known/apple-app-site-association`
   - Must be served with `Content-Type: application/json`
   - Must be accessible via HTTPS

3. **Add Associated Domains** in `app.json` (already configured):
```json
"associatedDomains": ["applinks:coinshit.app"]
```

### Android App Links

1. **Create Digital Asset Links file**:
Create `.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.coinshit.app",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

2. **Get SHA256 fingerprint**:
```bash
eas credentials
```

3. **Host on your domain**:
   - Upload to: `https://coinshit.app/.well-known/assetlinks.json`

4. **Intent filters** (already configured in `app.json`)

## Environment Variables

For sensitive data (API keys), use environment variables:

1. **Create `.env` file** (already in .gitignore):
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
...
```

2. **Install dotenv**:
```bash
npm install dotenv
```

3. **Load in `services/firebase.ts`**:
```typescript
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  // ...
};
```

4. **Configure in `app.json`**:
```json
"extra": {
  "firebaseApiKey": process.env.FIREBASE_API_KEY,
  ...
}
```

## Performance Optimization

### Image Optimization

1. **Use WebP format** for uploaded images
2. **Implement lazy loading** for entry list
3. **Add image caching** with `expo-image`

### API Optimization

1. **Implement server-side caching** for Bitcoin prices
2. **Use Cloud Functions** to batch API calls
3. **Consider CoinGecko Pro** for higher rate limits

### Bundle Size

1. **Analyze bundle**:
```bash
npx expo export:web
npx source-map-explorer web-build/static/js/*.js
```

2. **Code splitting** (automatic with Expo Router)
3. **Remove unused dependencies**

## Monitoring & Analytics

### Firebase Analytics

1. **Enable in Firebase Console**
2. **Install package**:
```bash
npx expo install @react-native-firebase/analytics
```

3. **Add to app**:
```typescript
import analytics from '@react-native-firebase/analytics';

// Log events
await analytics().logEvent('entry_created', {
  currency: entry.currency,
  amount: entry.fiatAmount
});
```

### Crashlytics

```bash
npx expo install @react-native-firebase/crashlytics
```

### Sentry (Alternative)

```bash
npx expo install @sentry/react-native
```

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx expo export:web
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id

  deploy-ios:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx eas-cli build --platform ios --non-interactive
```

## Post-Deployment Checklist

- [ ] Test all features on production
- [ ] Verify deep links work
- [ ] Test on multiple devices
- [ ] Monitor Firebase usage
- [ ] Set up alerts for errors
- [ ] Create support/feedback channel
- [ ] Submit app for review
- [ ] Prepare marketing materials
- [ ] Set up social media accounts
- [ ] Monitor App Store/Play Store reviews

## Maintenance

### Regular Updates

1. **Update dependencies monthly**:
```bash
npm outdated
npm update
```

2. **Test after updates**:
```bash
npm start
```

3. **Deploy new versions**:
```bash
eas build --platform all --auto-submit
```

### Monitoring

- Check Firebase Console daily
- Review crash reports
- Monitor API usage (CoinGecko)
- Track user feedback

### Backups

Firebase automatically backs up data, but consider:
- Export Firestore data monthly
- Version control all code
- Document configuration changes

## Costs

**Estimated monthly costs** (for ~10,000 users):

- **Firebase**: $25-50 (Blaze plan)
- **CoinGecko API**: $0-129 (free tier may suffice)
- **Firebase Hosting**: $0-5
- **Expo/EAS**: $0-29 (optional)
- **Domain**: $12/year
- **Apple Developer**: $99/year
- **Google Play**: $25 one-time

**Total**: ~$50-100/month + $111-124/year

## Support

For deployment issues:
- [Expo Documentation](https://docs.expo.dev)
- [Firebase Support](https://firebase.google.com/support)
- [GitHub Issues](https://github.com/yourusername/coinshit/issues)
