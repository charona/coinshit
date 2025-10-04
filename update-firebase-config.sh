#!/bin/bash

# Firebase Configuration Update Script
# This script helps you update your Firebase configuration

echo "🔥 Firebase Configuration Update Helper"
echo "========================================"
echo ""
echo "You'll need your Firebase config from:"
echo "https://console.firebase.google.com/"
echo ""
echo "Go to: Project Settings > General > Your apps > Web app > Config"
echo ""
echo "Enter your Firebase configuration values:"
echo ""

read -p "API Key: " API_KEY
read -p "Auth Domain (e.g., coinshit-xxxxx.firebaseapp.com): " AUTH_DOMAIN
read -p "Project ID: " PROJECT_ID
read -p "Storage Bucket (e.g., coinshit-xxxxx.appspot.com): " STORAGE_BUCKET
read -p "Messaging Sender ID: " MESSAGING_SENDER_ID
read -p "App ID: " APP_ID

echo ""
echo "Creating backup of current firebase.ts..."
cp services/firebase.ts services/firebase.ts.backup

echo ""
echo "Updating services/firebase.ts..."

cat > services/firebase.ts << EOF
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "${API_KEY}",
  authDomain: "${AUTH_DOMAIN}",
  projectId: "${PROJECT_ID}",
  storageBucket: "${STORAGE_BUCKET}",
  messagingSenderId: "${MESSAGING_SENDER_ID}",
  appId: "${APP_ID}"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
EOF

echo ""
echo "✅ Configuration updated successfully!"
echo ""
echo "Your old config has been backed up to: services/firebase.ts.backup"
echo ""
echo "Next steps:"
echo "1. Run: npm run web"
echo "2. Test creating an entry"
echo "3. Check Firebase Console to verify data is saved"
echo ""
