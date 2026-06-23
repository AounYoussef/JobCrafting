
// Update to Firebase v9 modular syntax
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyASqOOGEJTdWiV2KbUkAxb3VJS5PvDD9z4",
  authDomain: "job-crafting.firebaseapp.com",
  projectId: "job-crafting",
  storageBucket: "job-crafting.firebasestorage.app",
  messagingSenderId: "303950806430",
  appId: "1:303950806430:web:dda3acccb2fd1d6fdeea8f",
  measurementId: "G-0PVS7M6KQL"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();