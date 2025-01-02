import { getApp, initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, } from "firebase/firestore"; // Import Firestore services
import { getStorage,  } from "firebase/storage"; // Import Firebase Storage services
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);  // Initialize Firestore
const storage = getStorage(app); // Initialize Firebase Storage
const rtdb = getDatabase(app)

export { app, auth, db, storage, rtdb };
