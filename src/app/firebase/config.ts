import { getApp, initializeApp, getApps } from "firebase/app";
import { FacebookAuthProvider, getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore services
import { getStorage } from "firebase/storage"; // Import Firebase Storage services
import { getDatabase } from "firebase/database"; // Import Firebase Realtime Database services

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCsbskHSH4rdXCLJk4l3Ws4qnavO5LiLA4",
  authDomain: "pet-care-pro-77695.firebaseapp.com",
  projectId: "pet-care-pro-77695",
  storageBucket: "pet-care-pro-77695.firebasestorage.app",
  messagingSenderId: "281007959598",
  appId: "1:281007959598:web:62dd86d4836643ea8b39b",
  databaseURL: "https://pet-care-pro-77695-default-rtdb.asia-southeast1.firebasedatabase.app/",
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
