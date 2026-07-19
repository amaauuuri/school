"use client";

import { formatCurrency, useServitotalStore } from "@/lib/store";

export function ReportsView() {
  const { report } = useServitotalStore();
  const maxSales = Math.max(...report.salesByHour.map((s) => s.amount));

  return (
    <>
      <div className="grid grid--3" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-card__label">Ventas totales (hoy)</div>
          <div className="stat-card__value">
            {formatCurrency(report.totalSales)}
          </div>
          <div className="stat-card__change">↑ 12% vs ayer</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Órdenes del día</div>
          <div className="stat-card__value">{report.ordersToday}</div>
          <div className="stat-card__change">↑ 8% vs ayer</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Ticket promedio</div>
          <div className="stat-card__value">
            {formatCurrency(report.averageTicket)}
          </div>
          <div className="stat-card__change">↑ 3% vs ayer</div>
        </div>
      </div>

      <div className="grid grid--2">
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>
            Ventas por hora
          </h3>
          <div className="chart-bars">
            {report.salesByHour.map((entry) => (
              <div key={entry.hour} className="chart-bar">
                <div
                  className="chart-bar__fill"
                  style={{
                    height: `${(entry.amount / maxSales) * 100}%`,
                  }}
                  title={formatCurrency(entry.amount)}
                />
                <span className="chart-bar__label">{entry.hour}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>
            Platillos más vendidos
          </h3>
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
              {report.topDishes.map((dish, i) => (
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
      </div>
    </>
  );
}
