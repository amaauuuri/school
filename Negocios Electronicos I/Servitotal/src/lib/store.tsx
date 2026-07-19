"use client";

/**
 * store.tsx
 *
 * After connecting Firestore, this store only manages UI-local ephemeral state:
 * - activeTableId: which table the current user has selected in the session.
 *
 * All persistent data (menu, orders, config, reports) lives in FirestoreContext.
 * Utility exports (formatCurrency, labels) remain here for convenience.
 */

import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import type { MenuCategory, TableStatus } from "./types";

interface ServitotalState {
  activeTableId: string | null;
  setActiveTableId: (id: string | null) => void;
}

const ServitotalContext = createContext<ServitotalState | null>(null);

export function ServitotalProvider({ children }: { children: ReactNode }) {
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  const value = useMemo(
    () => ({ activeTableId, setActiveTableId }),
    [activeTableId]
  );

  return (
    <ServitotalContext.Provider value={value}>
      {children}
    </ServitotalContext.Provider>
  );
}

export function useServitotalStore() {
  const ctx = useContext(ServitotalContext);
  if (!ctx) {
    throw new Error("useServitotalStore must be used within ServitotalProvider");
  }
  return ctx;
}

// ─── Static label maps ────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<MenuCategory, string> = {
  alimentos: "Alimentos",
  bebidas: "Bebidas",
  postres: "Postres",
};

export const STATUS_LABELS: Record<TableStatus, string> = {
  disponible: "Disponible",
  ocupada: "Ocupada",
  por_pagar: "Por Pagar",
};

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}
