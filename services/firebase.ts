import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { Platform } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhY9TQ6GII7t1XobkZW9fIRhRb0PuWo8k",
  authDomain: "coinshit-f6bc8.firebaseapp.com",
  projectId: "coinshit-f6bc8",
  storageBucket: "coinshit-f6bc8.firebasestorage.app",
  messagingSenderId: "297785046559",
  appId: "1:297785046559:web:5c5f2aaecdb28ce920472a",
  measurementId: "G-HE361QT3TR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// App Check disabled due to configuration issues
// TODO: Re-enable with proper reCAPTCHA Enterprise setup
// if (Platform.OS === 'web' && typeof window !== 'undefined') {
//   try {
//     const appCheck = initializeAppCheck(app, {
//       provider: new ReCaptchaV3Provider('6LdTJt8rAAAAAGkMAIUpE_BtAA9cox_X1tL68CuV'),
//       isTokenAutoRefreshEnabled: true
//     });
//     console.log('App Check initialized successfully');
//   } catch (error) {
//     console.error('Error initializing App Check:', error);
//   }
// }

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
