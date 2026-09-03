import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import defaultConfig from '../../firebase-applet-config.json';

// Helper to strip any enclosing quotation marks and trim whitespace
const cleanStr = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  return val.replace(/^["']|["']$/g, '').trim();
};

const metaEnv = (import.meta as any).env || {};

// Sanitize candidate values; defaultConfig is the primary verified config provisioned by AI Studio
const pickValid = (defaultVal: string | undefined, envVal: string | undefined): string => {
  const cleanedDefault = cleanStr(defaultVal);
  if (cleanedDefault && !cleanedDefault.includes('your_') && !cleanedDefault.includes('...')) {
    return cleanedDefault;
  }
  const cleanedEnv = cleanStr(envVal);
  if (cleanedEnv && !cleanedEnv.includes('your_') && !cleanedEnv.includes('...')) {
    return cleanedEnv;
  }
  return cleanedDefault || cleanedEnv || '';
};

const firebaseConfig = {
  apiKey: pickValid(defaultConfig.apiKey, metaEnv.VITE_FIREBASE_API_KEY),
  authDomain: pickValid(defaultConfig.authDomain, metaEnv.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: pickValid(defaultConfig.projectId, metaEnv.VITE_FIREBASE_PROJECT_ID),
  storageBucket: pickValid(defaultConfig.storageBucket, metaEnv.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: pickValid(defaultConfig.messagingSenderId, metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: pickValid(defaultConfig.appId, metaEnv.VITE_FIREBASE_APP_ID),
  firestoreDatabaseId: pickValid(defaultConfig.firestoreDatabaseId, metaEnv.VITE_FIREBASE_DATABASE_ID),
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

// Test connection on boot as recommended by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
if (typeof window !== 'undefined') {
  testConnection();
}

// Standardized Firestore error handling required by Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default app;

