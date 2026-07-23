"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import {
  initRestaurantIfNeeded,
  subscribeRestaurant,
  subscribeMenu,
  subscribeActiveOrders,
  subscribeTodaySales,
  addMenuItem as fsAddMenuItem,
  updateMenuItem as fsUpdateMenuItem,
  deleteMenuItem as fsDeleteMenuItem,
  updateRestaurantConfig as fsUpdateRestaurantConfig,
  createOrder as fsCreateOrder,
  updateOrderItems as fsUpdateOrderItems,
  updateOrderStatus as fsUpdateOrderStatus,
  closeOrderAndRecord as fsCloseOrderAndRecord,
  importMenuItemsBatch as fsImportMenuItemsBatch,
} from "./firestoreService";
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

// ─── Context shape ────────────────────────────────────────────────────────────

interface FirestoreContextType {
  // Data
  restaurantId: string | null;
  restaurantConfig: RestaurantDoc | null;
  menu: MenuItem[];
  activeOrders: GlobalOrder[];
  salesHistory: SaleRecord[];
  loadingData: boolean;

  // Menu actions
  addMenuItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<Omit<MenuItem, "id">>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  importMenuItemsBatch: (items: Omit<MenuItem, "id">[]) => Promise<void>;

  // Config actions
  updateRestaurantConfig: (data: Partial<RestaurantConfig>) => Promise<void>;

  // Order actions
  createOrder: (mesaNumero: number, items: OrderItem[], staffUid: string) => Promise<string>;
  updateOrderItems: (orderId: string, items: OrderItem[]) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  closeOrderAndRecord: (order: GlobalOrder, paymentMethod: PaymentMethod) => Promise<void>;
}

const FirestoreContext = createContext<FirestoreContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FirestoreProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();

  const [restaurantConfig, setRestaurantConfig] = useState<RestaurantDoc | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<GlobalOrder[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // restaurantId = admin's UID (or the admin's restaurantName-based id for staff)
  // For simplicity, staff find restaurantId from their profile.restaurantName matching
  // the restaurant document. Since the admin's UID IS the restaurantId, we look it up
  // for staff by searching the users collection (already done in AuthContext profile).
  // For now, ADMIN restaurantId = user.uid, STAFF restaurantId = needs to be stored in profile.
  // We'll derive it from profile.restaurantId (added below) or fall back to user.uid for admin.
  const restaurantId = useMemo(() => {
    if (!profile) return null;
    if (profile.role === "ADMIN") return user?.uid ?? null;
    // Staff need restaurantId stored in their profile
    return (profile as any).restaurantId ?? null;
  }, [profile, user]);

  useEffect(() => {
    if (!restaurantId || !profile || !user) {
      setLoadingData(false);
      return;
    }

    // For ADMIN: ensure the restaurant document and menu seed exist
    if (profile.role === "ADMIN") {
      initRestaurantIfNeeded(restaurantId, {
        name: profile.name,
        email: profile.email,
        restaurantName: profile.restaurantName,
      }).catch(console.error);
    }

    setLoadingData(true);

    // Subscribe to all real-time listeners
    const unsubs: Array<() => void> = [];

    unsubs.push(
      subscribeRestaurant(restaurantId, (data) => {
        setRestaurantConfig(data);
        setLoadingData(false);
      })
    );

    unsubs.push(subscribeMenu(restaurantId, setMenu));

    unsubs.push(subscribeActiveOrders(restaurantId, setActiveOrders));

    // Sales history only for admins (used in reports)
    if (profile.role === "ADMIN") {
      unsubs.push(subscribeTodaySales(restaurantId, setSalesHistory));
    }

    return () => unsubs.forEach((u) => u());
  }, [restaurantId, profile?.role, user?.uid]);

  // ─── Actions (memoized, bound to restaurantId) ──────────────────────────────

  const addMenuItem = useCallback(
    async (item: Omit<MenuItem, "id">) => {
      if (!restaurantId) return;
      await fsAddMenuItem(restaurantId, item);
    },
    [restaurantId]
  );

  const updateMenuItem = useCallback(
    async (id: string, updates: Partial<Omit<MenuItem, "id">>) => {
      if (!restaurantId) return;
      await fsUpdateMenuItem(restaurantId, id, updates);
    },
    [restaurantId]
  );

  const deleteMenuItem = useCallback(
    async (id: string) => {
      if (!restaurantId) return;
      await fsDeleteMenuItem(restaurantId, id);
    },
    [restaurantId]
  );

  const importMenuItemsBatch = useCallback(
    async (items: Omit<MenuItem, "id">[]) => {
      if (!restaurantId) return;
      await fsImportMenuItemsBatch(restaurantId, items);
    },
    [restaurantId]
  );

  const updateRestaurantConfig = useCallback(
    async (data: Partial<RestaurantConfig>) => {
      if (!restaurantId) return;
      await fsUpdateRestaurantConfig(restaurantId, data);
    },
    [restaurantId]
  );

  const createOrder = useCallback(
    async (mesaNumero: number, items: OrderItem[], staffUid: string) => {
      if (!restaurantId) return "";
      return await fsCreateOrder(restaurantId, mesaNumero, items, staffUid);
    },
    [restaurantId]
  );

  const updateOrderItems = useCallback(
    async (orderId: string, items: OrderItem[]) => {
      await fsUpdateOrderItems(orderId, items);
    },
    []
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      await fsUpdateOrderStatus(orderId, status);
    },
    []
  );

  const closeOrderAndRecord = useCallback(
    async (order: GlobalOrder, paymentMethod: PaymentMethod) => {
      const taxRate = restaurantConfig?.taxRate ?? 0.16;
      await fsCloseOrderAndRecord(order, paymentMethod, taxRate);
    },
    [restaurantConfig]
  );

  const value = useMemo<FirestoreContextType>(
    () => ({
      restaurantId,
      restaurantConfig,
      menu,
      activeOrders,
      salesHistory,
      loadingData,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      importMenuItemsBatch,
      updateRestaurantConfig,
      createOrder,
      updateOrderItems,
      updateOrderStatus,
      closeOrderAndRecord,
    }),
    [
      restaurantId,
      restaurantConfig,
      menu,
      activeOrders,
      salesHistory,
      loadingData,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      importMenuItemsBatch,
      updateRestaurantConfig,
      createOrder,
      updateOrderItems,
      updateOrderStatus,
      closeOrderAndRecord,
    ]
  );

  return (
    <FirestoreContext.Provider value={value}>
      {children}
    </FirestoreContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFirestore() {
  const ctx = useContext(FirestoreContext);
  if (!ctx) throw new Error("useFirestore must be used within FirestoreProvider");
  return ctx;
}
