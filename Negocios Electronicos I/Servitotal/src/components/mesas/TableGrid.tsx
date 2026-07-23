"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { STATUS_LABELS, formatCurrency, useServitotalStore } from "@/lib/store";
import { useFirestore } from "@/lib/FirestoreContext";
import type { TableStatus } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadgeVariant(
  status: TableStatus
): "success" | "warning" | "danger" {
  if (status === "disponible") return "success";
  if (status === "ocupada") return "warning";
  return "danger";
}

/** Derive a TableStatus from the order status on that table */
function orderStatusToTableStatus(orderStatus: string): TableStatus {
  if (orderStatus === "por_pagar") return "por_pagar";
  return "ocupada";
}

// ─── Derived table type (from live orders) ────────────────────────────────────

interface DerivedTable {
  mesaNumero: number;
  status: TableStatus;
  totalAmount: number;
  orderId: string | null;
}

// ─── TableCard ────────────────────────────────────────────────────────────────

interface TableCardProps {
  table: DerivedTable;
  selected: boolean;
  onSelect: (table: DerivedTable) => void;
  onTomarOrden: (table: DerivedTable) => void;
  onEnviarCaja: (table: DerivedTable) => void;
}

function TableCard({ table, selected, onSelect, onTomarOrden, onEnviarCaja }: TableCardProps) {
  return (
    <div
      className={`table-card table-card--${table.status} ${
        selected ? "table-card--selected" : ""
      }`}
      onClick={() => onSelect(table)}
      style={{ position: "relative" }}
    >
      <span className="table-card__number">Mesa {table.mesaNumero}</span>
      <Badge variant={statusBadgeVariant(table.status)}>
        {STATUS_LABELS[table.status]}
      </Badge>
      {table.totalAmount > 0 && (
        <span className="text-sm" style={{ fontWeight: 600 }}>
          {formatCurrency(table.totalAmount)}
        </span>
      )}

      {/* Hover action overlay for desktop */}
      <div className="table-card-overlay">
        <button
          type="button"
          className="btn btn--primary btn--sm"
          style={{
            width: "100%",
            fontSize: "0.75rem",
            padding: "0.375rem 0.5rem",
            backgroundColor: "#e85d04",
            borderColor: "#e85d04",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onTomarOrden(table);
          }}
        >
          Tomar Orden
        </button>

        {table.orderId && table.status !== "por_pagar" && table.status !== "disponible" && (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            style={{
              width: "100%",
              fontSize: "0.75rem",
              padding: "0.375rem 0.5rem",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEnviarCaja(table);
            }}
          >
            Enviar a Caja
          </button>
        )}
      </div>
    </div>
  );
}

// ─── TableGrid ────────────────────────────────────────────────────────────────

export function TableGrid() {
  const router = useRouter();
  const { activeTableId, setActiveTableId } = useServitotalStore();
  const { activeOrders, restaurantConfig, updateOrderStatus, loadingData } = useFirestore();

  const tableCount = restaurantConfig?.tableCount ?? 12;

  // Build an index of mesaNumero → active order
  const orderByTable = new Map<number, (typeof activeOrders)[0]>();
  activeOrders.forEach((o) => {
    // Keep the most-recent order if a table somehow has multiples
    if (!orderByTable.has(o.mesaNumero) || o.createdAt > (orderByTable.get(o.mesaNumero)?.createdAt ?? "")) {
      orderByTable.set(o.mesaNumero, o);
    }
  });

  // Generate all tables — status derived from orders
  const tables: DerivedTable[] = Array.from({ length: tableCount }, (_, i) => {
    const n = i + 1;
    const order = orderByTable.get(n);
    return {
      mesaNumero: n,
      status: order ? orderStatusToTableStatus(order.status) : "disponible",
      totalAmount: order?.totalAmount ?? 0,
      orderId: order?.id ?? null,
    };
  });

  // Active table (identified by mesaNumero stored as string key)
  const activeTable = activeTableId
    ? tables.find((t) => String(t.mesaNumero) === activeTableId)
    : null;

  function handleSelect(table: DerivedTable) {
    setActiveTableId(String(table.mesaNumero));
  }

  function handleTomarOrden(table: DerivedTable) {
    setActiveTableId(String(table.mesaNumero));
    router.push("/dashboard/ordenes");
  }

  async function handleEnviarCaja(table: DerivedTable) {
    if (table.orderId) {
      try {
        await updateOrderStatus(table.orderId, "por_pagar");
      } catch (err) {
        console.error("Error setting table status to por_pagar:", err);
        alert("No se pudo enviar la orden a caja.");
      }
    }
  }

  function handleGoToOrders() {
    if (activeTableId) router.push("/dashboard/ordenes");
  }

  function handleGoToCash() {
    if (activeTableId) router.push("/dashboard/caja");
  }

  if (loadingData) {
    return (
      <div style={{ padding: "2rem", color: "var(--color-text-muted)", textAlign: "center" }}>
        Cargando mesas...
      </div>
    );
  }

  return (
    <>
      {/* Legend */}
      <div className="legend">
        <div className="legend__item">
          <span className="legend__dot legend__dot--disponible" />
          Disponible
        </div>
        <div className="legend__item">
          <span className="legend__dot legend__dot--ocupada" />
          Ocupada
        </div>
        <div className="legend__item">
          <span className="legend__dot legend__dot--por_pagar" />
          Por Pagar
        </div>
      </div>

      <div className="table-grid">
        {tables.map((table) => (
          <TableCard
            key={table.mesaNumero}
            table={table}
            selected={activeTableId === String(table.mesaNumero)}
            onSelect={handleSelect}
            onTomarOrden={handleTomarOrden}
            onEnviarCaja={handleEnviarCaja}
          />
        ))}
      </div>

      {activeTable && (
        <div
          className="card card--elevated"
          style={{
            marginTop: "1.5rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <strong>Mesa {activeTable.mesaNumero}</strong>
            <span className="text-muted text-sm" style={{ marginLeft: "0.75rem" }}>
              {STATUS_LABELS[activeTable.status]}
              {activeTable.totalAmount > 0 &&
                ` · ${formatCurrency(activeTable.totalAmount)}`}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="btn btn--outline btn--sm"
              onClick={handleGoToOrders}
            >
              Tomar orden
            </button>
            {activeTable.status !== "disponible" && (
              <button
                className="btn btn--primary btn--sm"
                onClick={handleGoToCash}
              >
                Ir a caja
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
