import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import defaultConfig from '../../firebase-applet-config.json';

// Helper to sanitize config values and ignore dummy placeholders
const getValidValue = (val: string | undefined, fallback: string): string => {
  if (!val || val.includes('your_') || val.includes('...') || val.trim() === '') {
    return fallback;
  }
  return val.trim();
};

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: getValidValue(metaEnv.VITE_FIREBASE_API_KEY, defaultConfig.apiKey),
  authDomain: getValidValue(metaEnv.VITE_FIREBASE_AUTH_DOMAIN, defaultConfig.authDomain),
  projectId: getValidValue(metaEnv.VITE_FIREBASE_PROJECT_ID, defaultConfig.projectId),
  storageBucket: getValidValue(metaEnv.VITE_FIREBASE_STORAGE_BUCKET, defaultConfig.storageBucket),
  messagingSenderId: getValidValue(metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID, defaultConfig.messagingSenderId),
  appId: getValidValue(metaEnv.VITE_FIREBASE_APP_ID, defaultConfig.appId),
  firestoreDatabaseId: getValidValue(metaEnv.VITE_FIREBASE_DATABASE_ID, defaultConfig.firestoreDatabaseId),
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Authentication & Google Auth Provider
export const auth = getAuth(app);
try {
  auth.useDeviceLanguage();
} catch (e) {
  // Ignore in non-browser environments
}

// Ensure local persistence
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Could not set Firebase auth persistence:', err);
  });
} catch (e) {
  console.warn('Auth persistence initialization skipped:', e);
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.addScope('openid');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore
const customDbId = firebaseConfig.firestoreDatabaseId;
export const db = customDbId && customDbId !== '(default)' 
  ? getFirestore(app, customDbId) 
  : getFirestore(app);

export default app;

