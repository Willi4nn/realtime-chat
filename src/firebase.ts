// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB3oTxHiYOY-YaKYJC5VMmYcZ-LWtdjPuc",
  authDomain: "real-time-chat-app-14d91.firebaseapp.com",
  projectId: "real-time-chat-app-14d91",
  storageBucket: "real-time-chat-app-14d91.firebasestorage.app",
  messagingSenderId: "820618283479",
  appId: "1:820618283479:web:36b0ef9e40aafe806d6392",
  measurementId: "G-MPWTQNCB2Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
