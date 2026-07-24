"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatCurrency, useServitotalStore } from "@/lib/store";
import { useFirestore } from "@/lib/FirestoreContext";
import type { GlobalOrder, PaymentMethod } from "@/lib/types";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "efectivo", label: "Efectivo", icon: "💵" },
  { id: "tarjeta", label: "Tarjeta", icon: "💳" },
  { id: "transferencia", label: "Transferencia", icon: "📱" },
];

const TIP_PERCENTAGES = [0, 10, 15, 20];

export function CashRegisterView() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [tipPercentage, setTipPercentage] = useState<number>(10); // 10% por defecto
  const [closing, setClosing] = useState(false);
  const [closedMsg, setClosedMsg] = useState(false);

  const { activeTableId, setActiveTableId } = useServitotalStore();
  const { activeOrders, restaurantConfig, closeOrderAndRecord } = useFirestore();
  const activeOrdersRef = useRef(activeOrders);

  activeOrdersRef.current = activeOrders;

  // Orders waiting to be paid
  const pendingOrders = activeOrders.filter((o) => o.status === "por_pagar");

  // Resolve the order currently displayed
  const mesaNumero = activeTableId ? parseInt(activeTableId, 10) : null;
  const selectedOrder: GlobalOrder | undefined =
    mesaNumero
      ? pendingOrders.find((o) => o.mesaNumero === mesaNumero)
      : pendingOrders[0];

  const taxRate = restaurantConfig?.taxRate ?? 0.16;
  const subtotal = selectedOrder?.totalAmount ?? 0;
  const tax = subtotal * taxRate;
  const tipAmount = subtotal * (tipPercentage / 100);
  const total = subtotal + tax + tipAmount;

  async function handleCloseTable() {
    if (!selectedOrder) return;
    setClosing(true);
    try {
      await closeOrderAndRecord(selectedOrder, paymentMethod, tipAmount);      setClosedMsg(true);

      const closedOrderId = selectedOrder.id;

      setTimeout(() => {
        setClosedMsg(false);
        setClosing(false);

        const nextPending = activeOrdersRef.current
          .filter((o) => o.status === "por_pagar" && o.id !== closedOrderId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

        if (nextPending.length > 0) {
          setActiveTableId(String(nextPending[0].mesaNumero));
        } else {
          setActiveTableId(null);
          router.push("/dashboard/mesas");
        }
      }, 1500);
    } catch (err) {
      console.error("Error closing table:", err);
      setClosing(false);
    }
  }

  if (pendingOrders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">💳</div>
        <h3 className="empty-state__title">No hay cuentas pendientes</h3>
        <p>Las mesas con órdenes activas aparecerán aquí para cobrar y cerrar.</p>
      </div>
    );
  }

  return (
    <div className="cash-layout">
      {/* ── Left: order detail ──────────────────────────────────────────────── */}
      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ fontWeight: 600 }}>
            Cuenta · Mesa {selectedOrder?.mesaNumero ?? "—"}
          </h2>
          {pendingOrders.length > 1 && (
            <select
              className="form-select"
              style={{ width: "auto" }}
              value={String(selectedOrder?.mesaNumero ?? "")}
              onChange={(e) => setActiveTableId(e.target.value)}
            >
              {pendingOrders.map((o) => (
                <option key={o.id} value={String(o.mesaNumero)}>
                  Mesa {o.mesaNumero}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="card-table-wrapper">
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
            {(selectedOrder?.items ?? []).map((line) => (
              <tr key={line.platilloId}>
                <td>{line.nombre}</td>
                <td>{line.cantidad}</td>
                <td>{formatCurrency(line.precioUnitario)}</td>
                <td>{formatCurrency(line.precioUnitario * line.cantidad)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* ── Right: payment summary ────────────────────────────────────────── */}
      <div className="card card--elevated">
        <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Resumen de pago</h3>

        <div className="bill-summary__row">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="bill-summary__row">
          <span>IVA ({((taxRate) * 100).toFixed(0)}%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>

        {/* ── Selector de Propina ────────────────────────────────────────── */}
        <div className="bill-summary__row" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.5rem", padding: "0.5rem 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Propina ({tipPercentage}%)</span>
            <span style={{ fontWeight: 600, color: "var(--color-success, #16a34a)" }}>
              {formatCurrency(tipAmount)}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.35rem" }}>
            {TIP_PERCENTAGES.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setTipPercentage(pct)}
                disabled={closing}
                style={{
                  flex: 1,
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  borderRadius: "var(--radius-sm, 6px)",
                  border: "1px solid var(--color-border, #cbd5e1)",
                  background: tipPercentage === pct ? "#e85d04" : "transparent",
                  color: tipPercentage === pct ? "white" : "inherit",
                  cursor: "pointer",
                }}
              >
                {pct === 0 ? "Sin propina" : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        <div className="bill-summary__row bill-summary__row--total">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <p className="text-sm text-muted" style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
          Método de pago
        </p>
        <div className="payment-methods">
          {PAYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`payment-method ${paymentMethod === opt.id ? "payment-method--selected" : ""}`}
              onClick={() => setPaymentMethod(opt.id)}
              disabled={closing}
            >
              <div className="payment-method__icon">{opt.icon}</div>
              <div className="payment-method__label">{opt.label}</div>
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          block
          size="lg"
          onClick={handleCloseTable}
          disabled={closing || !selectedOrder}
        >
          {closedMsg ? "✓ Mesa cerrada" : closing ? "Procesando..." : "Cerrar mesa y cobrar"}
        </Button>
      </div>
    </div>
  );
}