import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "youssef-jobcrafting.firebaseapp.com",
  projectId: "youssef-jobcrafting",
  storageBucket: "youssef-jobcrafting.firebasestorage.app",
  messagingSenderId: "546242722172",
  appId: "1:546242722172:web:c71144cd5e9dc9123e0cf9",
  measurementId: "G-F8QFZXHY65"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics only initializes in browser environments
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
