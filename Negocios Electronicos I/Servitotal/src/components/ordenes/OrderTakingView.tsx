"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, useServitotalStore } from "@/lib/store";
import { useFirestore } from "@/lib/FirestoreContext";
import { useAuth } from "@/lib/AuthContext";
import type { GlobalOrder, MenuItem, OrderItem } from "@/lib/types";

const DEFAULT_CATEGORIES = ["Alimentos", "Bebidas", "Postres"];

function normalizeCategories(raw: unknown): string[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_CATEGORIES;
  return raw
    .map((item) => (typeof item === "string" ? item : (item as { name: string }).name))
    .filter(Boolean);
}

export function OrderTakingView() {
  const { activeTableId, setActiveTableId } = useServitotalStore();
  const { menu, activeOrders, createOrder, updateOrderItems, updateOrderStatus, restaurantConfig } =
    useFirestore();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState<string>("");
  const [saving, setSaving] = useState(false);

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
  const creationPending = useRef(false);

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

  const categoriesList = normalizeCategories(
    (restaurantConfig as { customCategories?: unknown } | null)?.customCategories
  );

  useEffect(() => {
    if (categoriesList.length > 0 && !activeCategory) {
      setActiveCategory(categoriesList[0]);
    }
  }, [categoriesList, activeCategory]);

  const filteredMenu = menu.filter(
    (item) => item.category === activeCategory && item.available
  );

  // Keep cart in a ref for the debounce callback to always see the latest value
  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!mesaNumero || !user) return;
    if (cart.length === 0) return;

    // Check if local cart is identical to Firestore activeOrder items to avoid redundant saves
    const activeItems = activeOrder?.items ?? [];
    const isIdentical =
      activeItems.length === cart.length &&
      cart.every((item, idx) => {
        const other = activeItems[idx];
        return (
          other &&
          other.platilloId === item.platilloId &&
          other.cantidad === item.cantidad &&
          other.precioUnitario === item.precioUnitario &&
          (other.notas || "") === (item.notas || "")
        );
      });

    if (isIdentical) return;

    const delayDebounce = setTimeout(async () => {
      setSaving(true);
      try {
        if (activeOrder) {
          await updateOrderItems(activeOrder.id, cartRef.current);
        } else {
          // Prevent multiple concurrent creation calls
          if (creationPending.current) return;
          creationPending.current = true;
          const newId = await createOrder(mesaNumero, cartRef.current, user.uid);
          prevOrderId.current = newId;
          creationPending.current = false;
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => {
      clearTimeout(delayDebounce);
    };
  }, [cart, mesaNumero, user, activeOrder, createOrder, updateOrderItems]);

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
    setCart((prev) => {
      const updated = prev.filter((c) => c.platilloId !== platilloId);
      // If the cart becomes empty, clean it up immediately in Firestore
      if (updated.length === 0 && activeOrder) {
        updateOrderItems(activeOrder.id, []);
      }
      return updated;
    });
  }

  function changeQuantity(platilloId: string, delta: number) {
    setCart((prev) => {
      const updated = prev.map((c) =>
        c.platilloId === platilloId ? { ...c, cantidad: c.cantidad + delta } : c
      );
      const filtered = updated.filter((c) => c.cantidad > 0);
      // If the cart becomes empty, clean it up immediately in Firestore
      if (filtered.length === 0 && activeOrder) {
        updateOrderItems(activeOrder.id, []);
      }
      return filtered;
    });
  }

  async function handleSendToPay() {
    if (!mesaNumero || cart.length === 0 || !user) return;
    setSaving(true);
    try {
      if (activeOrder) {
        // Persist local cart, then flag as por_pagar
        await updateOrderItems(activeOrder.id, cart);
        await updateOrderStatus(activeOrder.id, "por_pagar");
      } else {
        const newId = await createOrder(mesaNumero, cart, user.uid);
        await updateOrderStatus(newId, "por_pagar");
      }
      // Redirect back to map
      setActiveTableId(null);
    } catch (err) {
      console.error(err);
      alert("Error al enviar a caja.");
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
            onChange={(e) => {
              setActiveTableId(e.target.value);
            }}
          >
            {Array.from({ length: restaurantConfig?.tableCount ?? 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                Mesa {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Main Category Tabs */}
        <div className="category-tabs">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-tab ${activeCategory === cat ? "category-tab--active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu item cards */}
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
          {filteredMenu.length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
              No hay platillos disponibles en esta sección.
            </div>
          )}
        </div>
      </div>

      {/* ── Right: cart ───────────────────────────────────────────────────── */}
      <aside className="order-cart">
        <div className="order-cart__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Orden · Mesa {mesaNumero}</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 500, color: saving ? "var(--color-primary)" : "var(--color-success)" }}>
            {saving ? "🔄 Guardando..." : "✓ Sincronizado"}
          </span>
        </div>
        
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
                    onClick={() => {
                      if (line.cantidad > 1) {
                        changeQuantity(line.platilloId, -1);
                      } else {
                        removeItem(line.platilloId);
                      }
                    }}
                  >
                    −
                  </button>
                  <span>{line.cantidad}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => {
                      changeQuantity(line.platilloId, 1);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="order-cart__footer order-cart__footer--desktop">
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
              <Button variant="primary" block onClick={handleSendToPay} disabled={saving}>
                {saving ? "Procesando..." : "Enviar a caja"}
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Floating mobile button */}
      {cart.length > 0 && (
        <div className="mobile-floating-bar">
          <Button
            variant="primary"
            block
            size="lg"
            onClick={handleSendToPay}
            disabled={saving}
            style={{
              backgroundColor: "#e85d04",
              borderColor: "#e85d04",
              boxShadow: "0 10px 25px -5px rgba(232, 93, 4, 0.4)",
              fontWeight: 700
            }}
          >
            {saving ? "Procesando..." : `Enviar a Caja (${formatCurrency(cartTotal)})`}
          </Button>
        </div>
      )}
    </div>
  );
}
