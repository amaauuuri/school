"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/store";
import { useFirestore } from "@/lib/FirestoreContext";

export function ReportsView() {
  const { salesHistory, loadingData } = useFirestore();

  // ─── Compute metrics from live sales_history ──────────────────────────────

  const metrics = useMemo(() => {
    if (salesHistory.length === 0) {
      return {
        totalSales: 0,
        ordersToday: 0,
        averageTicket: 0,
        topDishes: [] as { name: string; quantity: number; revenue: number }[],
        salesByHour: [] as { hour: string; amount: number }[],
      };
    }

    const totalSales = salesHistory.reduce((s, r) => s + r.totalAmount, 0);
    const ordersToday = salesHistory.length;
    const averageTicket = ordersToday > 0 ? totalSales / ordersToday : 0;

    // Top dishes
    const dishMap = new Map<string, { quantity: number; revenue: number }>();
    salesHistory.forEach((record) => {
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

    // Sales by hour
    const hourMap = new Map<string, number>();
    salesHistory.forEach((record) => {
      const hour = new Date(record.closedAt).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      hourMap.set(hour, (hourMap.get(hour) ?? 0) + record.totalAmount);
    });
    const salesByHour = Array.from(hourMap.entries())
      .map(([hour, amount]) => ({ hour, amount }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    return { totalSales, ordersToday, averageTicket, topDishes, salesByHour };
  }, [salesHistory]);

  const maxSales =
    metrics.salesByHour.length > 0
      ? Math.max(...metrics.salesByHour.map((s) => s.amount))
      : 1;

  if (loadingData) {
    return (
      <div style={{ padding: "2rem", color: "var(--color-text-muted)", textAlign: "center" }}>
        Cargando reportes...
      </div>
    );
  }

  return (
    <>
      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid--3" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-card__label">Ventas totales (hoy)</div>
          <div className="stat-card__value">{formatCurrency(metrics.totalSales)}</div>
          <div className="stat-card__change">
            {metrics.ordersToday > 0 ? `${metrics.ordersToday} órdenes` : "Sin ventas aún"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Órdenes del día</div>
          <div className="stat-card__value">{metrics.ordersToday}</div>
          <div className="stat-card__change">Actualizado en tiempo real</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Ticket promedio</div>
          <div className="stat-card__value">{formatCurrency(metrics.averageTicket)}</div>
          <div className="stat-card__change">Por comanda pagada</div>
        </div>
      </div>

      <div className="grid grid--2">
        {/* Sales by hour chart */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Ventas por hora</h3>
          {metrics.salesByHour.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
              Sin datos de ventas por hora todavía.
            </div>
          ) : (
            <div className="chart-bars">
              {metrics.salesByHour.map((entry) => (
                <div key={entry.hour} className="chart-bar">
                  <div
                    className="chart-bar__fill"
                    style={{ height: `${(entry.amount / maxSales) * 100}%` }}
                    title={formatCurrency(entry.amount)}
                  />
                  <span className="chart-bar__label">{entry.hour}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top dishes */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Platillos más vendidos</h3>
          {metrics.topDishes.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
              Sin ventas registradas hoy.
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </>
  );
}
