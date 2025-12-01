// src/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // for working proje-dont use for testing
  apiKey: "AIzaSyCXPue-ldCuFZqntLZpelPjI2GPhSJDjew",
  authDomain: "oshwal.firebaseapp.com",
  projectId: "oshwal",
  storageBucket: "oshwal.firebasestorage.app",
  messagingSenderId: "62716093795",
  appId: "1:62716093795:web:796c3a718c0db14fb55f56"
};

const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
export const datastore = getFirestore(app);

// ⭐ IMPORTANT — Persist login across refresh + PWA
setPersistence(auth, browserLocalPersistence)
  .catch((err) => console.error("Auth Persistence Error:", err));
