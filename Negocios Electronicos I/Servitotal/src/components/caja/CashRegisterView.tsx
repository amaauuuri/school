"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, useServitotalStore } from "@/lib/store";
import type { PaymentMethod } from "@/lib/types";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "efectivo", label: "Efectivo", icon: "💵" },
  { id: "tarjeta", label: "Tarjeta", icon: "💳" },
  { id: "transferencia", label: "Transferencia", icon: "📱" },
];

export function CashRegisterView() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [closed, setClosed] = useState(false);
  const {
    tables,
    activeTableId,
    setActiveTableId,
    config,
    getTableSubtotal,
    getTableTotal,
    closeTable,
  } = useServitotalStore();

  const tablesWithOrders = tables.filter((t) => t.order.length > 0);
  const activeTable =
    tables.find((t) => t.id === activeTableId) ?? tablesWithOrders[0];

  const tableId = activeTable?.id;
  const subtotal = tableId ? getTableSubtotal(tableId) : 0;
  const tax = subtotal * config.taxRate;
  const total = tableId ? getTableTotal(tableId) : 0;

  function handleCloseTable() {
    if (!tableId) return;
    closeTable(tableId, paymentMethod);
    setClosed(true);
    setTimeout(() => {
      setClosed(false);
      router.push("/dashboard/mesas");
    }, 1500);
  }

  if (!activeTable || activeTable.order.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">💳</div>
        <h3 className="empty-state__title">No hay cuentas pendientes</h3>
        <p>
          Las mesas con órdenes activas aparecerán aquí para cobrar y cerrar.
        </p>
      </div>
    );
  }

  return (
    <div className="cash-layout">
      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ fontWeight: 600 }}>Cuenta · Mesa {activeTable.number}</h2>
          {tablesWithOrders.length > 1 && (
            <select
              className="form-select"
              style={{ width: "auto" }}
              value={activeTable.id}
              onChange={(e) => setActiveTableId(e.target.value)}
            >
              {tablesWithOrders.map((t) => (
                <option key={t.id} value={t.id}>
                  Mesa {t.number}
                </option>
              ))}
            </select>
          )}
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Platillo</th>
              <th>Cant.</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {activeTable.order.map((line) => (
              <tr key={line.id}>
                <td>{line.name}</td>
                <td>{line.quantity}</td>
                <td>{formatCurrency(line.price)}</td>
                <td>{formatCurrency(line.price * line.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card card--elevated">
        <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Resumen de pago</h3>

        <div className="bill-summary__row">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="bill-summary__row">
          <span>IVA ({(config.taxRate * 100).toFixed(0)}%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="bill-summary__row bill-summary__row--total">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <p
          className="text-sm text-muted"
          style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}
        >
          Método de pago
        </p>
        <div className="payment-methods">
          {PAYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`payment-method ${
                paymentMethod === opt.id ? "payment-method--selected" : ""
              }`}
              onClick={() => setPaymentMethod(opt.id)}
            >
              <div className="payment-method__icon">{opt.icon}</div>
              <div className="payment-method__label">{opt.label}</div>
            </button>
          ))}
        </div>

        <Button variant="primary" block size="lg" onClick={handleCloseTable}>
          {closed ? "✓ Mesa cerrada" : "Cerrar mesa y cobrar"}
        </Button>
      </div>
    </div>
  );
}
