"use client";

import { useMemo, useState, useEffect } from "react";
import { formatCurrency } from "@/lib/store";
import { useFirestore } from "@/lib/FirestoreContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SaleRecord } from "@/lib/types";

export function ReportsView() {
  const { restaurantId } = useFirestore();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<SaleRecord[]>([]);

  // Filter states
  const [filterType, setFilterType] = useState<"day" | "week" | "month" | "custom">("day");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Fetch sales history dynamically according to range selection
  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let startIso = "";
    let endIso = "";

    if (filterType === "day") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startIso = today.toISOString();
    } else if (filterType === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      startIso = weekAgo.toISOString();
    } else if (filterType === "month") {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      monthAgo.setHours(0, 0, 0, 0);
      startIso = monthAgo.toISOString();
    } else if (filterType === "custom") {
      if (customStart) {
        const start = new Date(customStart + "T00:00:00");
        startIso = start.toISOString();
      }
      if (customEnd) {
        const end = new Date(customEnd + "T23:59:59");
        endIso = end.toISOString();
      }
    }

    const constraints = [where("restaurantId", "==", restaurantId)];

    if (startIso) {
      constraints.push(where("closedAt", ">=", startIso));
    }
    if (endIso) {
      constraints.push(where("closedAt", "<=", endIso));
    }

    const q = query(collection(db, "sales_history"), ...constraints);

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SaleRecord, "id">),
        }));

        docs.sort((a, b) => a.closedAt.localeCompare(b.closedAt));

        setSales(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Sales query error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [restaurantId, filterType, customStart, customEnd]);

  // Compute metrics from fetched sales
  const metrics = useMemo(() => {
    if (sales.length === 0) {
      return {
        totalSales: 0,
        totalTips: 0,
        ordersToday: 0,
        averageTicket: 0,
        topDishes: [] as { name: string; quantity: number; revenue: number }[],
        chartData: [] as { label: string; amount: number }[],
      };
    }

    const totalSales = sales.reduce((s, r) => s + r.totalAmount, 0);
    const totalTips = sales.reduce((s, r) => {
      const rec = r as SaleRecord & { tip?: number; propina?: number };
      return s + (rec.tip ?? rec.propina ?? 0);
    }, 0);
    const ordersToday = sales.length;
    const averageTicket = ordersToday > 0 ? totalSales / ordersToday : 0;

    // Top dishes
    const dishMap = new Map<string, { quantity: number; revenue: number }>();
    sales.forEach((record) => {
      record.items.forEach((item) => {
        const existing = dishMap.get(item.nombre) ?? { quantity: 0, revenue: 0 };
        dishMap.set(item.nombre, {
          quantity: existing.quantity + item.cantidad,
          revenue: existing.revenue + item.precioUnitario * item.cantidad,
        });
      });
    });
    const topDishes = Array.from(dishMap.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Grouping
    const isSingleDay =
      filterType === "day" || (filterType === "custom" && customStart && customStart === customEnd);
    const groupMap = new Map<string, number>();

    sales.forEach((record) => {
      let key = "";
      const dateObj = new Date(record.closedAt);
      if (isSingleDay) {
        const hourStr = String(dateObj.getHours()).padStart(2, "0");
        key = `${hourStr}:00`;
      } else {
        const dayStr = String(dateObj.getDate()).padStart(2, "0");
        const monthStr = String(dateObj.getMonth() + 1).padStart(2, "0");
        key = `${dayStr}/${monthStr}`;
      }
      groupMap.set(key, (groupMap.get(key) ?? 0) + record.totalAmount);
    });

    const chartData = Array.from(groupMap.entries())
      .map(([label, amount]) => ({ label, amount }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return { totalSales, totalTips, ordersToday, averageTicket, topDishes, chartData };
  }, [sales, filterType, customStart, customEnd]);

  const maxSales = useMemo(() => {
    if (metrics.chartData.length === 0) return 1;
    return Math.max(...metrics.chartData.map((s) => s.amount));
  }, [metrics.chartData]);

  const isSingleDay =
    filterType === "day" || (filterType === "custom" && customStart && customStart === customEnd);

  return (
    <>
      {/* ── Filter Selector ────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div>
            <h3 style={{ fontWeight: 600, fontSize: "1.1rem" }}>Rango de Reporte</h3>
            <p className="text-sm text-muted">Filtra y visualiza el historial de ventas del negocio</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => setFilterType("day")}
                style={{
                  padding: "0.5rem 0.75rem",
                  border: "none",
                  background: filterType === "day" ? "#e85d04" : "var(--color-surface)",
                  color: filterType === "day" ? "white" : "var(--color-text)",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setFilterType("week")}
                style={{
                  padding: "0.5rem 0.75rem",
                  border: "none",
                  background: filterType === "week" ? "#e85d04" : "var(--color-surface)",
                  color: filterType === "week" ? "white" : "var(--color-text)",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Semana
              </button>
              <button
                type="button"
                onClick={() => setFilterType("month")}
                style={{
                  padding: "0.5rem 0.75rem",
                  border: "none",
                  background: filterType === "month" ? "#e85d04" : "var(--color-surface)",
                  color: filterType === "month" ? "white" : "var(--color-text)",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Mes
              </button>
              <button
                type="button"
                onClick={() => setFilterType("custom")}
                style={{
                  padding: "0.5rem 0.75rem",
                  border: "none",
                  background: filterType === "custom" ? "#e85d04" : "var(--color-surface)",
                  color: filterType === "custom" ? "white" : "var(--color-text)",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Personalizado
              </button>
            </div>

            {filterType === "custom" && (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: "0.35rem 0.625rem", fontSize: "0.875rem" }}
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  aria-label="Fecha inicio"
                />
                <span className="text-muted">al</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: "0.35rem 0.625rem", fontSize: "0.875rem" }}
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  aria-label="Fecha fin"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-muted" style={{ padding: "3rem", textAlign: "center" }}>
          Cargando métricas...
        </div>
      ) : (
        <>
          {/* ── KPI cards ──────────────────────────────────────────────────────── */}
          <div className="grid grid--4" style={{ marginBottom: "1.5rem" }}>
            <div className="stat-card">
              <div className="stat-card__label">Ventas totales</div>
              <div className="stat-card__value">{formatCurrency(metrics.totalSales)}</div>
              <div className="stat-card__change">Exclusivo de platillos y menú</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Ingreso por propinas</div>
              <div className="stat-card__value">{formatCurrency(metrics.totalTips)}</div>
              <div className="stat-card__change">Acumulado para el personal</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Órdenes concretadas</div>
              <div className="stat-card__value">{metrics.ordersToday}</div>
              <div className="stat-card__change">En el periodo seleccionado</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Ticket promedio</div>
              <div className="stat-card__value">{formatCurrency(metrics.averageTicket)}</div>
              <div className="stat-card__change">Por comanda cerrada</div>
            </div>
          </div>

          <div className="grid grid--2">
            {/* Vertical Bar Chart (Elevated Bars) */}
            <div className="card">
              <h3 style={{ fontWeight: 600, marginBottom: "1.25rem" }}>
                {isSingleDay ? "Ventas por hora" : "Ventas por fecha"}
              </h3>
              {metrics.chartData.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                  Sin datos de ventas en este rango.
                </div>
              ) : (
                <div style={{ overflowX: "auto", width: "100%", paddingBottom: "0.5rem" }}>
                  <div
                    style={{
                      minWidth: metrics.chartData.length * 50 > 300 ? `${metrics.chartData.length * 55}px` : "100%",
                      display: "flex",
                      gap: "0.85rem",
                      alignItems: "flex-end",
                      height: "220px",
                      paddingTop: "1.75rem",
                      borderBottom: "2px solid var(--color-border, #e2e8f0)",
                    }}
                  >
                    {metrics.chartData.map((entry) => {
                      const heightPercent = Math.max((entry.amount / maxSales) * 100, 6);
                      return (
                        <div
                          key={entry.label}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            height: "100%",
                            justifyContent: "flex-end",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              color: "var(--color-text, #1e293b)",
                              marginBottom: "0.3rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            ${entry.amount >= 1000 ? `${(entry.amount / 1000).toFixed(1)}k` : Math.round(entry.amount)}
                          </span>

                          <div
                            style={{
                              width: "100%",
                              maxWidth: "36px",
                              height: `${heightPercent}%`,
                              background: "linear-gradient(180deg, #ff7b00 0%, #e85d04 100%)",
                              borderRadius: "6px 6px 0 0",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0 4px 6px -1px rgba(232, 93, 4, 0.2)",
                              cursor: "pointer",
                            }}
                            title={`${entry.label}: ${formatCurrency(entry.amount)}`}
                          />

                          <span
                            style={{
                              marginTop: "0.5rem",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "var(--color-text-muted, #64748b)",
                            }}
                          >
                            {entry.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Top dishes */}
            <div className="card">
              <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Platillos más vendidos</h3>
              {metrics.topDishes.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                  Sin ventas registradas en este periodo.
                </div>
              ) : (
                <div className="reports-scroll-wrapper card-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Platillo</th>
                        <th>Cant.</th>
                        <th>Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.topDishes.map((dish, i) => (
                        <tr key={dish.name}>
                          <td>{i + 1}</td>
                          <td>{dish.name}</td>
                          <td>{dish.quantity}</td>
                          <td>{formatCurrency(dish.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}