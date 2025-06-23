import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyBJuRT5wnTgKtWQTi5UF-kC_FUxDPMNm-I",
  authDomain: "fps-vr.firebaseapp.com",
  projectId: "fps-vr",
  storageBucket: "fps-vr.firebasestorage.app",
  messagingSenderId: "787766248148",
  appId: "1:787766248148:web:003b7b2f186d1c6768f141",
  measurementId: "G-WE4JJ6SES0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Log successful initialization
console.log('Firebase initialized successfully with Blaze plan features');

export default app; 