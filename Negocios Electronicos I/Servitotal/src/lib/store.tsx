"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  INITIAL_CONFIG,
  INITIAL_MENU,
  INITIAL_TABLES,
  MOCK_REPORT,
} from "./mock-data";
import type {
  DailyReport,
  MenuCategory,
  MenuItem,
  OrderLine,
  PaymentMethod,
  RestaurantConfig,
  Table,
  TableStatus,
} from "./types";

interface ServitotalState {
  menu: MenuItem[];
  tables: Table[];
  config: RestaurantConfig;
  report: DailyReport;
  activeTableId: string | null;
  setActiveTableId: (id: string | null) => void;
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  addItemToTable: (tableId: string, item: MenuItem) => void;
  removeItemFromTable: (tableId: string, lineId: string) => void;
  updateItemQuantity: (tableId: string, lineId: string, quantity: number) => void;
  openTable: (tableId: string) => void;
  closeTable: (tableId: string, paymentMethod: PaymentMethod) => void;
  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  updateConfig: (updates: Partial<RestaurantConfig>) => void;
  syncTablesWithConfig: () => void;
  getTableSubtotal: (tableId: string) => number;
  getTableTotal: (tableId: string) => number;
}

const ServitotalContext = createContext<ServitotalState | null>(null);

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function ServitotalProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [config, setConfig] = useState<RestaurantConfig>(INITIAL_CONFIG);
  const [report] = useState<DailyReport>(MOCK_REPORT);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  const getTableSubtotal = useCallback(
    (tableId: string) => {
      const table = tables.find((t) => t.id === tableId);
      if (!table) return 0;
      return table.order.reduce(
        (sum, line) => sum + line.price * line.quantity,
        0
      );
    },
    [tables]
  );

  const getTableTotal = useCallback(
    (tableId: string) => {
      const subtotal = getTableSubtotal(tableId);
      return subtotal + subtotal * config.taxRate;
    },
    [getTableSubtotal, config.taxRate]
  );

  const updateTableStatus = useCallback(
    (tableId: string, status: TableStatus) => {
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, status } : t))
      );
    },
    []
  );

  const openTable = useCallback((tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: "ocupada", openedAt: new Date().toISOString() }
          : t
      )
    );
  }, []);

  const addItemToTable = useCallback((tableId: string, item: MenuItem) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const existing = t.order.find((l) => l.menuItemId === item.id);
        const order: OrderLine[] = existing
          ? t.order.map((l) =>
              l.menuItemId === item.id
                ? { ...l, quantity: l.quantity + 1 }
                : l
            )
          : [
              ...t.order,
              {
                id: generateId("line"),
                menuItemId: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
              },
            ];
        return {
          ...t,
          status: t.status === "disponible" ? "ocupada" : t.status,
          openedAt: t.openedAt ?? new Date().toISOString(),
          order,
        };
      })
    );
  }, []);

  const removeItemFromTable = useCallback(
    (tableId: string, lineId: string) => {
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? { ...t, order: t.order.filter((l) => l.id !== lineId) }
            : t
        )
      );
    },
    []
  );

  const updateItemQuantity = useCallback(
    (tableId: string, lineId: string, quantity: number) => {
      if (quantity <= 0) return;
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                order: t.order.map((l) =>
                  l.id === lineId ? { ...l, quantity } : l
                ),
              }
            : t
        )
      );
    },
    []
  );

  const closeTable = useCallback(
    (_tableId: string, _paymentMethod: PaymentMethod) => {
      setTables((prev) =>
        prev.map((t) =>
          t.id === _tableId
            ? {
                ...t,
                status: "disponible",
                order: [],
                openedAt: undefined,
              }
            : t
        )
      );
      setActiveTableId(null);
    },
    []
  );

  const addMenuItem = useCallback((item: Omit<MenuItem, "id">) => {
    setMenu((prev) => [...prev, { ...item, id: generateId("menu") }]);
  }, []);

  const updateMenuItem = useCallback(
    (id: string, updates: Partial<MenuItem>) => {
      setMenu((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
    },
    []
  );

  const deleteMenuItem = useCallback((id: string) => {
    setMenu((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateConfig = useCallback((updates: Partial<RestaurantConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const syncTablesWithConfig = useCallback(() => {
    setTables((prev) => {
      const count = config.tableCount;
      if (prev.length === count) return prev;
      if (prev.length > count) return prev.slice(0, count);
      const newTables: Table[] = [];
      for (let i = prev.length; i < count; i++) {
        newTables.push({
          id: generateId("t"),
          number: i + 1,
          capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
          status: "disponible",
          order: [],
        });
      }
      return [...prev, ...newTables];
    });
  }, [config.tableCount]);

  const value = useMemo(
    () => ({
      menu,
      tables,
      config,
      report,
      activeTableId,
      setActiveTableId,
      updateTableStatus,
      addItemToTable,
      removeItemFromTable,
      updateItemQuantity,
      openTable,
      closeTable,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      updateConfig,
      syncTablesWithConfig,
      getTableSubtotal,
      getTableTotal,
    }),
    [
      menu,
      tables,
      config,
      report,
      activeTableId,
      updateTableStatus,
      addItemToTable,
      removeItemFromTable,
      updateItemQuantity,
      openTable,
      closeTable,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      updateConfig,
      syncTablesWithConfig,
      getTableSubtotal,
      getTableTotal,
    ]
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

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}
