"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  User,
  getAuth,
  signOut as secondarySignOut,
  sendEmailVerification as secondarySendEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
  signUpAdmin: (name: string, restaurantName: string, email: string, password: string) => Promise<void>;
  createStaffAccount: (name: string, email: string, password: string) => Promise<void>;
  setupRecaptcha: (containerId: string) => RecaptchaVerifier;
  sendPhoneCode: (phoneNumber: string, containerId?: string) => Promise<ConfirmationResult>;
  confirmPhoneCode: (
    confirmationResult: ConfirmationResult,
    code: string,
    extraData?: { name?: string; restaurantName?: string }
  ) => Promise<void>;
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
    return "El correo o la contraseña son incorrectos.";
  }
  if (code === "auth/email-already-in-use") {
    return "Este correo ya está registrado en Servitotal.";
  }
  if (code === "auth/invalid-phone-number") {
    return "El número de teléfono no es válido. Incluye la clave de país (ej. +521234567890).";
  }
  if (code === "auth/invalid-verification-code") {
    return "El código de verificación SMS ingresado es incorrecto.";
  }
  if (code === "auth/code-expired") {
    return "El código de verificación ha expirado. Por favor solicita uno nuevo.";
  }
  if (code === "auth/too-many-requests") {
    return "Se han realizado demasiados intentos. Por favor espera unos minutos.";
  }
  if (code === "auth/captcha-check-failed") {
    return "La verificación de reCAPTCHA falló. Intenta de nuevo.";
  }
  return error?.message || "Algo salió mal. Por favor, inténtalo de nuevo.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign In
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Immediately fetch profile
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

  // Sign Up Admin (Owner)
  const signUpAdmin = async (
    name: string,
    restaurantName: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email,
        name,
        restaurantName,
        role: "ADMIN",
        createdAt: new Date().toISOString(),
      };

      // Save profile to firestore
      await setDoc(doc(db, "users", firebaseUser.uid), newProfile);
      
      // Update local state directly to avoid races
      setUser(firebaseUser);
      setProfile(newProfile);

      // Force Email Verification
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
    // The admin's UID IS the restaurantId in Firestore
    const restaurantId = user.uid;

    // Use a secondary App instance to avoid logging out the current admin
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
        restaurantId, // ← link staff to the admin's restaurant
      };

      // Save STAFF profile to firestore using the primary db client
      await setDoc(doc(db, "users", newStaffUser.uid), newStaffProfile);

      // Send verification email to the new staff user
      await secondarySendEmail(newStaffUser);

      // Log out from secondary instance so it doesn't persist
      await secondarySignOut(secondaryAuth);
      await deleteApp(secondaryApp);
    } catch (error) {
      // Cleanup app if error occurs
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

  // Phone Authentication Setup & Execution
  const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
    if (typeof window === "undefined") {
      throw new Error("Recaptcha context is only available in client environment.");
    }
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (_) {}
    }
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: "normal",
      callback: () => {},
      "expired-callback": () => {},
    });
    (window as any).recaptchaVerifier = verifier;
    return verifier;
  };

  const sendPhoneCode = async (
    phoneNumber: string,
    containerId = "recaptcha-container"
  ): Promise<ConfirmationResult> => {
    setLoading(true);
    try {
      let appVerifier = (window as any).recaptchaVerifier;
      if (!appVerifier) {
        appVerifier = setupRecaptcha(containerId);
      }
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      (window as any).confirmationResult = confirmationResult;
      setLoading(false);
      return confirmationResult;
    } catch (error) {
      setLoading(false);
      if ((window as any).recaptchaWidgetId !== undefined && (window as any).grecaptcha) {
        (window as any).grecaptcha.reset((window as any).recaptchaWidgetId);
      }
      throw new Error(mapFirebaseError(error));
    }
  };

  const confirmPhoneCode = async (
    confirmationResult: ConfirmationResult,
    code: string,
    extraData?: { name?: string; restaurantName?: string }
  ) => {
    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(code);
      const firebaseUser = userCredential.user;

      // Check if user profile exists in Firestore
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const existingProfile = docSnap.data() as UserProfile;
        setUser(firebaseUser);
        setProfile(existingProfile);
      } else {
        // Create new user profile for phone registered user
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || `${firebaseUser.phoneNumber?.replace("+", "") || firebaseUser.uid}@servitotal.app`,
          phone: firebaseUser.phoneNumber || undefined,
          name: extraData?.name || "Usuario Servitotal",
          restaurantName: extraData?.restaurantName || "Mi Restaurante",
          role: "ADMIN",
          createdAt: new Date().toISOString(),
        };

        await setDoc(docRef, newProfile);
        setUser(firebaseUser);
        setProfile(newProfile);
      }
    } catch (error) {
      throw new Error(mapFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUpAdmin,
        createStaffAccount,
        setupRecaptcha,
        sendPhoneCode,
        confirmPhoneCode,
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
