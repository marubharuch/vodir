// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtc1RZKwtd3XLB7p1Lqv4UH8NJdfjlHIg",
  authDomain: "oswal-directory.firebaseapp.com",
  databaseURL: "https://oswal-directory-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "oswal-directory",
  storageBucket: "oswal-directory.appspot.com", // fixed
  messagingSenderId: "185682670464",
  appId: "1:185682670464:web:74b02c59cc5e39ca12c765",
  measurementId: "G-58JWX0RV57"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
export const datastore = getFirestore(app);