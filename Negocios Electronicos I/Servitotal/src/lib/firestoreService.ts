/**
 * firestoreService.ts
 *
 * Pure Firestore access layer — no React, no hooks.
 * All components interact with Firestore through these functions.
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { INITIAL_MENU, INITIAL_CONFIG } from "./mock-data";
import type {
  GlobalOrder,
  MenuItem,
  MenuCategory,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  RestaurantConfig,
  RestaurantDoc,
  SaleRecord,
} from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function toDate(ts: any): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === "string") return ts;
  return new Date().toISOString();
}

// ─── Restaurants ─────────────────────────────────────────────────────────────

/**
 * Called once after login. Creates the restaurant document + seeds the menu
 * with demo items if neither exists yet.
 */
export async function initRestaurantIfNeeded(
  uid: string,
  profile: { name: string; email: string; restaurantName: string }
): Promise<void> {
  const restaurantRef = doc(db, "restaurants", uid);
  const snap = await getDoc(restaurantRef);

  if (!snap.exists()) {
    const restaurantDoc: Omit<RestaurantDoc, "id"> = {
      name: profile.restaurantName,
      address: INITIAL_CONFIG.address,
      phone: INITIAL_CONFIG.phone,
      email: profile.email,
      tableCount: INITIAL_CONFIG.tableCount,
      taxRate: INITIAL_CONFIG.taxRate,
      duenoUid: uid,
      createdAt: new Date().toISOString(),
    };
    await setDoc(restaurantRef, restaurantDoc);

    // Seed demo menu items
    const batch = writeBatch(db);
    INITIAL_MENU.forEach((item) => {
      const menuRef = doc(db, "restaurants", uid, "menu", item.id);
      batch.set(menuRef, {
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        available: item.available,
      });
    });
    await batch.commit();
  }
}

export async function updateRestaurantConfig(
  restaurantId: string,
  data: Partial<RestaurantConfig>
): Promise<void> {
  const ref = doc(db, "restaurants", restaurantId);
  await updateDoc(ref, data as Record<string, unknown>);
}

export function subscribeRestaurant(
  restaurantId: string,
  callback: (data: RestaurantDoc | null) => void
): Unsubscribe {
  const ref = doc(db, "restaurants", restaurantId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...(snap.data() as Omit<RestaurantDoc, "id">) });
    } else {
      callback(null);
    }
  });
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export function subscribeMenu(
  restaurantId: string,
  callback: (items: MenuItem[]) => void
): Unsubscribe {
  const ref = collection(db, "restaurants", restaurantId, "menu");
  return onSnapshot(ref, (snap) => {
    const items: MenuItem[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<MenuItem, "id">),
    }));
    // Sort by category then name for consistent ordering
    items.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    callback(items);
  });
}

export async function addMenuItem(
  restaurantId: string,
  item: Omit<MenuItem, "id">
): Promise<string> {
  const id = generateId();
  const ref = doc(db, "restaurants", restaurantId, "menu", id);
  await setDoc(ref, item);
  return id;
}

export async function updateMenuItem(
  restaurantId: string,
  itemId: string,
  updates: Partial<Omit<MenuItem, "id">>
): Promise<void> {
  const ref = doc(db, "restaurants", restaurantId, "menu", itemId);
  await updateDoc(ref, updates as Record<string, unknown>);
}

export async function deleteMenuItem(
  restaurantId: string,
  itemId: string
): Promise<void> {
  const ref = doc(db, "restaurants", restaurantId, "menu", itemId);
  await deleteDoc(ref);
}

// ─── Orders Global ────────────────────────────────────────────────────────────

/**
 * Creates a new active order for a table.
 * Returns the Firestore document ID.
 */
export async function createOrder(
  restaurantId: string,
  mesaNumero: number,
  items: OrderItem[],
  staffUid: string
): Promise<string> {
  const totalAmount = items.reduce(
    (sum, i) => sum + i.precioUnitario * i.cantidad,
    0
  );
  const ref = collection(db, "orders_global");
  const docRef = await addDoc(ref, {
    restaurantId,
    mesaNumero,
    status: "pendiente" as OrderStatus,
    items,
    totalAmount,
    createdAt: new Date().toISOString(),
    poolStaff: staffUid,
  });
  return docRef.id;
}

/**
 * Updates only the items array and recalculates totalAmount.
 */
export async function updateOrderItems(
  orderId: string,
  items: OrderItem[]
): Promise<void> {
  const totalAmount = items.reduce(
    (sum, i) => sum + i.precioUnitario * i.cantidad,
    0
  );
  const ref = doc(db, "orders_global", orderId);
  await updateDoc(ref, { items, totalAmount });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const ref = doc(db, "orders_global", orderId);
  await updateDoc(ref, { status });
}

/**
 * Marks the order as paid, then writes an immutable SaleRecord to sales_history.
 */
export async function closeOrderAndRecord(
  order: GlobalOrder,
  paymentMethod: PaymentMethod,
  taxRate: number
): Promise<void> {
  const batch = writeBatch(db);

  // 1. Mark order as pagado
  const orderRef = doc(db, "orders_global", order.id);
  batch.update(orderRef, { status: "pagado", paymentMethod });

  // 2. Write immutable sales_history record
  const saleId = generateId();
  const saleRef = doc(db, "sales_history", saleId);
  const saleRecord: Omit<SaleRecord, "id"> = {
    restaurantId: order.restaurantId,
    mesaNumero: order.mesaNumero,
    items: order.items,
    totalAmount: order.totalAmount,
    paymentMethod,
    closedAt: new Date().toISOString(),
    poolStaff: order.poolStaff,
  };
  batch.set(saleRef, saleRecord);

  await batch.commit();
}

/**
 * Real-time listener for all non-paid orders of a restaurant.
 */
export function subscribeActiveOrders(
  restaurantId: string,
  callback: (orders: GlobalOrder[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "orders_global"),
    where("restaurantId", "==", restaurantId),
    where("status", "!=", "pagado"),
    orderBy("status"),
    orderBy("createdAt")
  );
  return onSnapshot(q, (snap) => {
    const orders: GlobalOrder[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        restaurantId: data.restaurantId,
        mesaNumero: data.mesaNumero,
        status: data.status as OrderStatus,
        items: data.items ?? [],
        totalAmount: data.totalAmount ?? 0,
        createdAt: toDate(data.createdAt),
        poolStaff: data.poolStaff ?? "",
        paymentMethod: data.paymentMethod,
      };
    });
    callback(orders);
  });
}

// ─── Sales History ────────────────────────────────────────────────────────────

/**
 * Real-time listener for today's sales (for admin reports).
 */
export function subscribeTodaySales(
  restaurantId: string,
  callback: (sales: SaleRecord[]) => void
): Unsubscribe {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, "sales_history"),
    where("restaurantId", "==", restaurantId),
    where("closedAt", ">=", todayStart.toISOString()),
    orderBy("closedAt")
  );

  return onSnapshot(q, (snap) => {
    const sales: SaleRecord[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SaleRecord, "id">),
    }));
    callback(sales);
  });
}
