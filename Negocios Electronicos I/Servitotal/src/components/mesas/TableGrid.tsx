"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import {
  STATUS_LABELS,
  formatCurrency,
  useServitotalStore,
} from "@/lib/store";
import type { Table, TableStatus } from "@/lib/types";

function statusBadgeVariant(
  status: TableStatus
): "success" | "warning" | "danger" {
  if (status === "disponible") return "success";
  if (status === "ocupada") return "warning";
  return "danger";
}

interface TableCardProps {
  table: Table;
  selected: boolean;
  onSelect: (table: Table) => void;
}

export function TableCard({ table, selected, onSelect }: TableCardProps) {
  const subtotal = table.order.reduce(
    (sum, l) => sum + l.price * l.quantity,
    0
  );

  return (
    <button
      type="button"
      className={`table-card table-card--${table.status} ${
        selected ? "table-card--selected" : ""
      }`}
      onClick={() => onSelect(table)}
    >
      <span className="table-card__number">Mesa {table.number}</span>
      <Badge variant={statusBadgeVariant(table.status)}>
        {STATUS_LABELS[table.status]}
      </Badge>
      <span className="table-card__capacity">
        {table.capacity} personas
      </span>
      {table.order.length > 0 && (
        <span className="text-sm" style={{ fontWeight: 600 }}>
          {formatCurrency(subtotal)}
        </span>
      )}
    </button>
  );
}

export function TableGrid() {
  const router = useRouter();
  const { tables, activeTableId, setActiveTableId, openTable } =
    useServitotalStore();

  function handleSelect(table: Table) {
    setActiveTableId(table.id);
    if (table.status === "disponible") {
      openTable(table.id);
    }
  }

  function handleGoToOrders() {
    if (activeTableId) router.push("/dashboard/ordenes");
  }

  function handleGoToCash() {
    if (activeTableId) router.push("/dashboard/caja");
  }

  const activeTable = tables.find((t) => t.id === activeTableId);

  return (
    <>
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
            key={table.id}
            table={table}
            selected={activeTableId === table.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {activeTable && (
        <div
          className="card card--elevated"
          style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            <strong>Mesa {activeTable.number}</strong>
            <span className="text-muted text-sm" style={{ marginLeft: "0.75rem" }}>
              {STATUS_LABELS[activeTable.status]} · {activeTable.order.length}{" "}
              ítems
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="btn btn--outline btn--sm"
              onClick={handleGoToOrders}
            >
              Tomar orden
            </button>
            {activeTable.order.length > 0 && (
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
