import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

if (process.env.NODE_ENV === 'development' && !firebaseConfig.projectId?.includes('test')) {
  throw new Error('Must use test Firebase project in development');
}

console.log('Firebase Config:', firebaseConfig);
console.log('Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey,
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

console.log('Current Firebase Project ID:', firebaseConfig.projectId);
console.log('Current Environment:', process.env.NODE_ENV);

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
  
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  console.log('Firebase services initialized');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

export { auth, db, storage };
export default app;