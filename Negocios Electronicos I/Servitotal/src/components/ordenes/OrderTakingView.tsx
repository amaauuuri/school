"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CATEGORY_LABELS, formatCurrency, useServitotalStore } from "@/lib/store";
import { useFirestore } from "@/lib/FirestoreContext";
import { useAuth } from "@/lib/AuthContext";
import type { GlobalOrder, MenuCategory, MenuItem, OrderItem } from "@/lib/types";

const CATEGORIES: MenuCategory[] = ["alimentos", "bebidas", "postres"];

/** Convert Firestore OrderItems → display-friendly cart lines */
function toCartLines(items: OrderItem[]) {
  return items.map((i) => ({
    platilloId: i.platilloId,
    nombre: i.nombre,
    cantidad: i.cantidad,
    precioUnitario: i.precioUnitario,
    notas: i.notas ?? "",
  }));
}

export function OrderTakingView() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>("alimentos");
  const [saving, setSaving] = useState(false);

  const { activeTableId, setActiveTableId } = useServitotalStore();
  const { menu, activeOrders, createOrder, updateOrderItems, updateOrderStatus, restaurantConfig } =
    useFirestore();
  const { user } = useAuth();

  // The mesaNumero is stored as a string in activeTableId
  const mesaNumero = activeTableId ? parseInt(activeTableId, 10) : null;

  // Find the active (non-paid) order for this table
  const activeOrder: GlobalOrder | undefined = mesaNumero
    ? activeOrders.find((o) => o.mesaNumero === mesaNumero && o.status !== "pagado")
    : undefined;

  // Local cart mirrors the Firestore order items
  const [cart, setCart] = useState<OrderItem[]>(activeOrder?.items ?? []);

  // Sync cart when the active order changes externally (real-time)
  const prevOrderId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (activeOrder && activeOrder.id !== prevOrderId.current) {
      setCart(activeOrder.items);
      prevOrderId.current = activeOrder.id;
    }
    if (!activeOrder) {
      setCart([]);
      prevOrderId.current = undefined;
    }
  }, [activeOrder]);

  const filteredMenu = menu.filter(
    (item) => item.category === activeCategory && item.available
  );

  // ─── Cart helpers ──────────────────────────────────────────────────────────

  function addItem(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.platilloId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.platilloId === item.id ? { ...c, cantidad: c.cantidad + 1 } : c
        );
      }
      return [
        ...prev,
        {
          platilloId: item.id,
          nombre: item.name,
          cantidad: 1,
          precioUnitario: item.price,
          notas: "",
        },
      ];
    });
  }

  function removeItem(platilloId: string) {
    setCart((prev) => prev.filter((c) => c.platilloId !== platilloId));
  }

  function changeQuantity(platilloId: string, delta: number) {
    setCart((prev) => {
      const updated = prev.map((c) =>
        c.platilloId === platilloId ? { ...c, cantidad: c.cantidad + delta } : c
      );
      return updated.filter((c) => c.cantidad > 0);
    });
  }

  // ─── Firestore save ────────────────────────────────────────────────────────

  async function handleSaveOrder() {
    if (!mesaNumero || cart.length === 0 || !user) return;
    setSaving(true);
    try {
      if (activeOrder) {
        await updateOrderItems(activeOrder.id, cart);
      } else {
        await createOrder(mesaNumero, cart, user.uid);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSendToPay() {
    if (!mesaNumero || cart.length === 0 || !user) return;
    setSaving(true);
    try {
      if (activeOrder) {
        // First persist current cart, then set to por_pagar
        await updateOrderItems(activeOrder.id, cart);
        await updateOrderStatus(activeOrder.id, "por_pagar");
      } else {
        const newId = await createOrder(mesaNumero, cart, user.uid);
        await updateOrderStatus(newId, "por_pagar");
      }
    } finally {
      setSaving(false);
    }
  }

  const cartTotal = cart.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);

  if (!mesaNumero) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🪑</div>
        <h3 className="empty-state__title">Selecciona una mesa</h3>
        <p>Ve al mapa de mesas y elige una mesa para comenzar la orden.</p>
      </div>
    );
  }

  return (
    <div className="menu-layout">
      {/* ── Left: menu + table selector ───────────────────────────────────── */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ fontWeight: 600 }}>Mesa {mesaNumero}</h2>
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={activeTableId ?? ""}
            onChange={(e) => setActiveTableId(e.target.value)}
          >
            {Array.from({ length: restaurantConfig?.tableCount ?? 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                Mesa {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-tab ${activeCategory === cat ? "category-tab--active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="menu-item-grid">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              type="button"
              className="menu-item-card"
              onClick={() => addItem(item)}
            >
              <div className="menu-item-card__name">{item.name}</div>
              <div className="menu-item-card__desc">{item.description}</div>
              <div className="menu-item-card__footer">
                <span className="menu-item-card__price">
                  {formatCurrency(item.price)}
                </span>
                <span className="text-sm text-muted">+ Agregar</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Right: cart ───────────────────────────────────────────────────── */}
      <aside className="order-cart">
        <div className="order-cart__header">Orden · Mesa {mesaNumero}</div>
        <div className="order-cart__body">
          {cart.length === 0 ? (
            <div className="order-cart__empty">Agrega platillos del menú</div>
          ) : (
            cart.map((line) => (
              <div key={line.platilloId} className="order-line">
                <div className="order-line__info">
                  <div className="order-line__name">{line.nombre}</div>
                  <div className="order-line__price">
                    {formatCurrency(line.precioUnitario)} c/u
                  </div>
                </div>
                <div className="order-line__qty">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() =>
                      line.cantidad > 1
                        ? changeQuantity(line.platilloId, -1)
                        : removeItem(line.platilloId)
                    }
                  >
                    −
                  </button>
                  <span>{line.cantidad}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => changeQuantity(line.platilloId, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="order-cart__footer">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
                fontWeight: 600,
              }}
            >
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Button variant="outline" block onClick={handleSaveOrder} disabled={saving}>
                {saving ? "Guardando..." : "Guardar orden"}
              </Button>
              <Button variant="primary" block onClick={handleSendToPay} disabled={saving}>
                {saving ? "..." : "Enviar a caja"}
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
