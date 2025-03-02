import { getApp, initializeApp, getApps } from "firebase/app";
import { FacebookAuthProvider, getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore services
import { getStorage } from "firebase/storage"; // Import Firebase Storage services
import { getDatabase } from "firebase/database"; // Import Firebase Realtime Database services

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE__AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABSE_URL,
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);  // Firestore
const storage = getStorage(app); // Firebase Storage
const rtdb = getDatabase(app); // Firebase Realtime Database
const provider = new GoogleAuthProvider();
const fbprovider = new FacebookAuthProvider();
export { app, auth, db, storage, rtdb, provider, fbprovider };
