import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCaErySMGDDWI0ioc-2IEKItyEs3J6w0zo",
  authDomain: "training-app-86d37.firebaseapp.com",
  projectId: "training-app-86d37",
  storageBucket: "training-app-86d37.firebasestorage.app",
  messagingSenderId: "659253984337",
  appId: "1:659253984337:web:4be43706fcf31068884c70",
  measurementId: "G-W1PPRXK21C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;