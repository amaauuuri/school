import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  FirestoreError 
} from "firebase/firestore";
import type { Order } from "./types";

// Firebase Configuration.
// Load environment variables if they exist, or fall back to dummy credentials.
const firebaseConfig = {
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || "YOUR_API_KEY",
  authDomain: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || "YOUR_AUTH_DOMAIN",
  projectId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || "YOUR_PROJECT_ID",
  storageBucket: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || "YOUR_STORAGE_BUCKET",
  messagingSenderId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || "YOUR_MESSAGING_SENDER_ID",
  appId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) || "YOUR_APP_ID"
};

// Check if configuration parameters are populated with real API values
export const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "YOUR_API_KEY" && 
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

// Conditional Initialization
let app;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase failed to initialize:", error);
  }
} else {
  console.warn(
    "[Firebase Config] API keys are unconfigured. The application will run in REACTIVE LOCAL MEMORY MODE (Mock database fallback)."
  );
}

export { db };

/**
 * Subscribes to a real-time stream of active/new orders for a specific restaurant tenant.
 * Uses onSnapshot from modular SDK when Firebase is active, or returns a no-op when running locally.
 *
 * @param restaurantId The unique document identifier for the restaurant
 * @param onOrdersUpdate Success callback received when there is any document change
 * @param onError Optional error callback to handle Firestore subscription issues
 * @returns A teardown function to unsubscribe from the listener
 */
export function subscribeToActiveOrders(
  restaurantId: string,
  onOrdersUpdate: (orders: Order[]) => void,
  onError?: (error: FirestoreError) => void
): () => void {
  if (!isFirebaseConfigured || !db) {
    // Return no-op. The UI component will query/subscribe from React-managed memory state.
    return () => {};
  }

  const ordersCollectionRef = collection(db, "restaurants", restaurantId, "orders");
  const activeOrdersQuery = query(
    ordersCollectionRef,
    where("status", "in", ["pending", "preparing", "ready", "served"]),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    activeOrdersQuery,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        } as Order);
      });
      onOrdersUpdate(orders);
    },
    (error) => {
      console.error(`[Firestore Live Stream Error] Restaurant: ${restaurantId}`, error);
      if (onError) {
        onError(error);
      }
    }
  );
}
