"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  getAuth,
  signOut as secondarySignOut,
  sendEmailVerification as secondarySendEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp, getApp, deleteApp } from "firebase/app";
import { auth, db, firebaseConfig } from "./firebase";

export interface UserProfile {
  uid: string;
  email: string;
  phone?: string;
  name: string;
  restaurantName: string;
  role: "ADMIN" | "STAFF";
  createdAt: string;
  /** For STAFF accounts: the admin owner's UID (= restaurantId in Firestore) */
  restaurantId?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPhoneOrEmail: (identifier: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpAdmin: (
    name: string,
    restaurantName: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<void>;
  createStaffAccount: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function mapFirebaseError(error: any): string {
  const code = error?.code;
  if (
    code === "auth/wrong-password" ||
    code === "auth/user-not-found" ||
    code === "auth/invalid-credential"
  ) {
    return "El correo/teléfono o la contraseña son incorrectos.";
  }
  if (code === "auth/email-already-in-use") {
    return "Este correo ya está registrado en Servitotal.";
  }
  if (code === "auth/too-many-requests") {
    return "Se han realizado demasiados intentos. Por favor espera unos minutos.";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Se cerró la ventana de inicio de sesión con Google.";
  }
  return error?.message || "Algo salió mal. Por favor, inténtalo de nuevo.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

// Reemplazar el useEffect inicial en AuthContext.tsx

useEffect(() => {
  const timeout = setTimeout(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // 🟢 Cargar el perfil del usuario desde Firestore
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
        } catch (error) {
          console.error("Error al obtener el perfil de Firestore:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, 100);

  return () => clearTimeout(timeout);
}, []);


  // Standard Email Sign In
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    } catch (error) {
      setLoading(false);
      throw new Error(mapFirebaseError(error));
    }
  };

  // Sign In with Phone or Email (Unified Single Field)
  const signInWithPhoneOrEmail = async (identifier: string, password: string) => {
    setLoading(true);
    const cleanId = identifier.trim();
    
    try {
      let targetEmail = cleanId;

      // If not an email (no '@'), search by phone number in Firestore
      if (!cleanId.includes("@")) {
        const cleanPhone = cleanId.replace(/\s+/g, "");
        const q = query(collection(db, "users"), where("phone", "==", cleanPhone));
        const querySnap = await getDocs(q);

        if (querySnap.empty) {
          throw { code: "auth/user-not-found" };
        }

        const userDoc = querySnap.docs[0].data() as UserProfile;
        targetEmail = userDoc.email;
      }

      await signIn(targetEmail, password);
    } catch (error) {
      setLoading(false);
      throw new Error(mapFirebaseError(error));
    }
  };

  // Google Sign In (Popup)
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const docRef = doc(db, "users", googleUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const newProfile: UserProfile = {
          uid: googleUser.uid,
          email: googleUser.email || "",
          phone: googleUser.phoneNumber || "",
          name: googleUser.displayName || "Partner Servitotal",
          restaurantName: googleUser.displayName ? `Restaurante de ${googleUser.displayName}` : "Mi Restaurante",
          role: "ADMIN",
          createdAt: new Date().toISOString(),
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      } else {
        setProfile(docSnap.data() as UserProfile);
      }
      setUser(googleUser);
    } catch (error) {
      setLoading(false);
      throw new Error(mapFirebaseError(error));
    }
  };

  // Sign Up Admin (Owner)
  const signUpAdmin = async (
    name: string,
    restaurantName: string,
    email: string,
    password: string,
    phone?: string
  ) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email,
        phone: phone ? phone.trim().replace(/\s+/g, "") : "",
        name,
        restaurantName,
        role: "ADMIN",
        createdAt: new Date().toISOString(),
      };

      // Save profile to firestore
      await setDoc(doc(db, "users", firebaseUser.uid), newProfile);
      
      setUser(firebaseUser);
      setProfile(newProfile);

      // Trigger Email Verification
      await sendEmailVerification(firebaseUser);
    } catch (error) {
      setLoading(false);
      throw new Error(mapFirebaseError(error));
    }
  };

  // Create Staff Account (Admin creates it for their restaurant)
  const createStaffAccount = async (name: string, email: string, password: string) => {
    if (!profile || profile.role !== "ADMIN" || !user) {
      throw new Error("Solo los administradores pueden crear cuentas de personal.");
    }

    const restaurantName = profile.restaurantName;
    const restaurantId = user.uid;

    let secondaryApp;
    try {
      secondaryApp = initializeApp(firebaseConfig, "secondary");
    } catch (e) {
      secondaryApp = getApp("secondary");
    }

    try {
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newStaffUser = userCredential.user;

      const newStaffProfile: UserProfile = {
        uid: newStaffUser.uid,
        email,
        name,
        restaurantName,
        role: "STAFF",
        createdAt: new Date().toISOString(),
        restaurantId,
      };

      await setDoc(doc(db, "users", newStaffUser.uid), newStaffProfile);
      await secondarySendEmail(newStaffUser);
      await secondarySignOut(secondaryAuth);
      await deleteApp(secondaryApp);
    } catch (error) {
      try {
        await deleteApp(secondaryApp);
      } catch (_) {}
      throw new Error(mapFirebaseError(error));
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  // Resend Verification Email
  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (error) {
        throw new Error(mapFirebaseError(error));
      }
    } else {
      throw new Error("No hay un usuario activo para verificar.");
    }
  };

  // Reload Auth state to check if email was verified
  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signInWithPhoneOrEmail,
        signInWithGoogle,
        signUpAdmin,
        createStaffAccount,
        logout,
        resendVerificationEmail,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
