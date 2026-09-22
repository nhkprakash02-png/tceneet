'use client';

// Firebase config — ported 1:1 from the original index.html. The ONLY thing the Next.js
// migration changed here is the env-var prefix: Vite's `import.meta.env.VITE_*` became Next's
// `process.env.NEXT_PUBLIC_*`, which is the exact equivalent browser-exposed mechanism. Every
// key, fallback value, and the DEMO_MODE flag are unchanged.
// Move this to environment variables (see .env.example) before committing to a public repo;
// client Firebase config values aren't secret by design, but keeping them out of source
// control is still good hygiene, especially since this project's Firestore rules should be
// the real access boundary (see README "Security notes").
//
// NOTE: Firebase Storage is deliberately NOT initialized here — profile photos are stored as
// compressed Base64 strings directly in Firestore instead (see src/lib/imageUtils.js), so this
// project can stay fully on the free Spark plan without needing Storage enabled at all.
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD1BcEn1cC8HMCcnopFcu_ma_i00bTw594',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'tce-neet.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'tce-neet',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'tce-neet.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID || '554869510136',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:554869510136:web:97137b6bdf2957c88100d',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-VYBDDV6F5',
};

export const DEMO_MODE = false;

let fbApp = null, fbAuth = null, fbDB = null;
try {
  fbApp = initializeApp(firebaseConfig);
  fbAuth = getAuth(fbApp);
  fbDB = getFirestore(fbApp);
} catch (e) {
  console.warn('Firebase init failed, using demo mode', e);
}

export { fbApp, fbAuth, fbDB };
export const googleProvider = new GoogleAuthProvider();
