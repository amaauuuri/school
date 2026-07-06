import { Timestamp } from "firebase/firestore";

/**
 * Restaurant tenant document structure (Root collection)
 */
export interface Restaurant {
  id?: string; // Document ID in Firestore
  name: string;
  ownerUid: string;
  status: "active" | "suspended" | "trial";
  subscription: {
    plan: "free" | "basic" | "premium";
    expiresAt: Timestamp;
  };
  settings: {
    currency: string;      // e.g. "USD", "MXN"
    taxRate: number;       // Decimal format (e.g., 0.16 for 16% VAT)
    serviceRate: number;   // Suggested tip/service rate (e.g., 0.10 for 10%)
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Table document structure (Subcollection under restaurants/{restaurantId}/tables)
 */
export interface Table {
  id?: string;
  number: string;          // e.g. "12", "Bar-A"
  capacity: number;
  status: "free" | "occupied" | "billing" | "dirty";
  currentOrderId: string | null; // ID of the active order for this table
  updatedAt: Timestamp;
}

/**
 * Menu product document structure (Subcollection under restaurants/{restaurantId}/products)
 */
export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  inStock: boolean;
  preparationStation: "kitchen" | "bar" | "oven" | "cold_station";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Single line item in an order
 */
export interface OrderItem {
  productId: string;
  name: string;            // Snapshotted name in case the product is edited/renamed later
  price: number;           // Snapshotted price at the exact moment of placing the order
  quantity: number;
  notes: string;           // Customer instructions (e.g. "no dairy", "extra hot")
  status: "pending" | "preparing" | "ready" | "served" | "cancelled";
  sentAt: Timestamp;       // When this specific item was added to the order
}

/**
 * Customer order document structure (Subcollection under restaurants/{restaurantId}/orders)
 */
export interface Order {
  id?: string;
  tableId: string;
  tableName: string;       // Denormalized table name/number for direct display
  orderNumber: number;     // Easy-to-read daily/session index (e.g. #42)
  status: "pending" | "preparing" | "ready" | "served" | "paid" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  paymentMethod: "cash" | "card" | "transfer" | null;
  createdBy: string;       // Staff UID (waiter) who created the order
  createdAt: Timestamp;
  updatedAt: Timestamp;
  closedAt: Timestamp | null; // Populated when paid or cancelled
}
