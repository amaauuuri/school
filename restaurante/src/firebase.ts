import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  FirestoreError 
} from "firebase/firestore";
import { Order } from "./types";

// Firebase Configuration.
// In a React + Vite environment, these values are typically loaded from environment
// variables prefixed with VITE_ to keep them environment-specific and secure.
const firebaseConfig = {
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || "YOUR_API_KEY",
  authDomain: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || "YOUR_AUTH_DOMAIN",
  projectId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || "YOUR_PROJECT_ID",
  storageBucket: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || "YOUR_STORAGE_BUCKET",
  messagingSenderId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || "YOUR_MESSAGING_SENDER_ID",
  appId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) || "YOUR_APP_ID"
};

// Initialize the Firebase core application instance
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore database connection
export const db = getFirestore(app);

/**
 * Subscribes to a real-time stream of active/new orders for a specific restaurant tenant.
 * Filters for orders that are in transitional states ("pending", "preparing", "ready", "served")
 * before they reach final state ("paid" or "cancelled").
 *
 * @param restaurantId The unique document identifier for the restaurant
 * @param onOrdersUpdate Success callback received when there is any document change
 * @param onError Optional error callback to handle Firestore subscription issues (e.g. permission denied)
 * @returns A teardown function to unsubscribe from the real-time listener
 */
export function subscribeToActiveOrders(
  restaurantId: string,
  onOrdersUpdate: (orders: Order[]) => void,
  onError?: (error: FirestoreError) => void
): () => void {
  // Reference the nested 'orders' subcollection belonging to the specific tenant
  const ordersCollectionRef = collection(db, "restaurants", restaurantId, "orders");

  // Build query: only active orders, sorted chronologically so newest orders appear first
  const activeOrdersQuery = query(
    ordersCollectionRef,
    where("status", "in", ["pending", "preparing", "ready", "served"]),
    orderBy("createdAt", "desc")
  );

  // Establish standard web SDK listener
  const unsubscribe = onSnapshot(
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

  // Return the unsubscribe function so components can prevent memory leaks on unmount
  return unsubscribe;
}
