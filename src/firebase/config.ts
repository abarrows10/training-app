import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

if (typeof window !== 'undefined') {
  console.log('Raw process.env:', {
    NODE_ENV: process.env.NODE_ENV,
    ALL_ENV: Object.keys(process.env)
  .filter(key => key.includes('FIREBASE'))
  .reduce((acc: { [key: string]: string }, key) => {
    acc[key] = process.env[key] || '';
    return acc;
  }, {})
  });
}

console.log('FIREBASE CONFIG USED:', {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  environment: process.env.NODE_ENV
});

/*
if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.includes('test') ||
    process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.includes('test')) {
  console.error('WARNING: Environment mismatch!');
  throw new Error('Must use test database in development and production database in production');
}
*/

console.log('Current environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

export const actionCodeSettings = {
  url: 'http://localhost:3000/finalize-signup',
  handleCodeInApp: true
};

console.log('Initializing Firebase with config:', firebaseConfig);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

export { auth, db, storage };
export default app;