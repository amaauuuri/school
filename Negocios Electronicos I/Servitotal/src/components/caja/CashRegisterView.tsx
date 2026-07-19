"use client";

import { useState } from "react";
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

export function CashRegisterView() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [closing, setClosing] = useState(false);
  const [closedMsg, setClosedMsg] = useState(false);

  const { activeTableId, setActiveTableId } = useServitotalStore();
  const { activeOrders, restaurantConfig, closeOrderAndRecord } = useFirestore();

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
  const total = subtotal + tax;

  async function handleCloseTable() {
    if (!selectedOrder) return;
    setClosing(true);
    try {
      await closeOrderAndRecord(selectedOrder, paymentMethod);
      setClosedMsg(true);
      // Clear active table selection, navigate back
      setTimeout(() => {
        setClosedMsg(false);
        setClosing(false);
        setActiveTableId(null);
        router.push("/dashboard/mesas");
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
