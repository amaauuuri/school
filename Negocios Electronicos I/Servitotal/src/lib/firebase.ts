import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyASuRDdHgpgVRtrRRTpQO7ptZ7mVB0tE8k",
  authDomain: "servitotal-d813f.firebaseapp.com",
  projectId: "servitotal-d813f",
  storageBucket: "servitotal-d813f.firebasestorage.app",
  messagingSenderId: "742800419389",
  appId: "1:742800419389:web:a0e74e3b88b4af3ff3d854"
};

// Initialize Firebase (singleton pattern to support hot reloading in Next.js)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
