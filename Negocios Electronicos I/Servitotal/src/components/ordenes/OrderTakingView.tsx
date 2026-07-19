"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  CATEGORY_LABELS,
  formatCurrency,
  useServitotalStore,
} from "@/lib/store";
import type { MenuCategory } from "@/lib/types";

const CATEGORIES: MenuCategory[] = ["alimentos", "bebidas", "postres"];

export function OrderTakingView() {
  const [activeCategory, setActiveCategory] =
    useState<MenuCategory>("alimentos");
  const {
    menu,
    tables,
    activeTableId,
    setActiveTableId,
    addItemToTable,
    removeItemFromTable,
    updateItemQuantity,
    updateTableStatus,
  } = useServitotalStore();

  const activeTable = tables.find((t) => t.id === activeTableId);
  const filteredMenu = menu.filter(
    (item) => item.category === activeCategory && item.available
  );

  function handleSendToPay() {
    if (activeTableId) {
      updateTableStatus(activeTableId, "por_pagar");
    }
  }

  if (!activeTable) {
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
          <h2 style={{ fontWeight: 600 }}>Mesa {activeTable.number}</h2>
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={activeTableId ?? ""}
            onChange={(e) => setActiveTableId(e.target.value)}
          >
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                Mesa {t.number}
              </option>
            ))}
          </select>
        </div>

        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-tab ${
                activeCategory === cat ? "category-tab--active" : ""
              }`}
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
              onClick={() => addItemToTable(activeTable.id, item)}
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

      <aside className="order-cart">
        <div className="order-cart__header">
          Orden · Mesa {activeTable.number}
        </div>
        <div className="order-cart__body">
          {activeTable.order.length === 0 ? (
            <div className="order-cart__empty">
              Agrega platillos del menú
            </div>
          ) : (
            activeTable.order.map((line) => (
              <div key={line.id} className="order-line">
                <div className="order-line__info">
                  <div className="order-line__name">{line.name}</div>
                  <div className="order-line__price">
                    {formatCurrency(line.price)} c/u
                  </div>
                </div>
                <div className="order-line__qty">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() =>
                      line.quantity > 1
                        ? updateItemQuantity(
                            activeTable.id,
                            line.id,
                            line.quantity - 1
                          )
                        : removeItemFromTable(activeTable.id, line.id)
                    }
                  >
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() =>
                      updateItemQuantity(
                        activeTable.id,
                        line.id,
                        line.quantity + 1
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {activeTable.order.length > 0 && (
          <div className="order-cart__footer">
            <Button variant="primary" block onClick={handleSendToPay}>
              Enviar a caja
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
