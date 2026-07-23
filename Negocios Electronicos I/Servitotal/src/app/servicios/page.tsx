"use client";

import Link from "next/link";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";

const SERVICIOS_DETALLADOS = [
  { icon: "🗺️", title: "Mesas en tiempo real", desc: "Visualiza mesas disponibles, ocupadas o listas para cobrar al instante." },
  { icon: "📝", title: "Comandas digitales", desc: "Levanta órdenes desde celular o tablet sin papel ni confusiones." },
  { icon: "⚖️", title: "IVA al 16% automático", desc: "Totales exactos sin cálculos manuales en cada comanda." },
  { icon: "💵", title: "Caja inteligente", desc: "Cobra en efectivo, tarjeta o transferencia y registra ventas al día." },
  { icon: "📈", title: "Métricas y analíticas", desc: "Ventas, ingresos y platillos más vendidos por día y hora." },
  { icon: "⚙️", title: "Menú personalizable", desc: "Platillos, precios y categorías adaptados a tu negocio." },
];

const DETAILED_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 499,
    period: "mes",
    description: "Para cafeterías y restaurantes pequeños.",
    tableLimit: "Hasta 8 mesas",
    features: [
      "Hasta 8 mesas activas",
      "Menú y categorías ilimitados",
      "Sincronización en tiempo real",
      "IVA al 16% automatizado",
      "Caja integrada",
      "Soporte por correo",
    ],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 899,
    period: "mes",
    description: "Para restaurantes medianos en crecimiento.",
    tableLimit: "Hasta 25 mesas",
    features: [
      "Hasta 25 mesas activas",
      "Cuentas STAFF ilimitadas",
      "Reportes en tiempo real",
      "Gestión de personal",
      "Multi-dispositivo",
      "Soporte prioritario",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 1499,
    period: "mes",
    description: "Para cadenas y alto volumen operativo.",
    tableLimit: "Hasta 50 mesas",
    features: [
      "Hasta 50 mesas activas",
      "Admin y staff ilimitados",
      "Reportes avanzados",
      "Listo para apps móviles",
      "Seguridad Firestore comercial",
      "Atención personalizada",
    ],
    highlighted: false,
  },
];

const WORKFLOW_STEPS = [
  { step: "1", title: "Registra tu cuenta", desc: "Crea tu perfil de administrador en minutos." },
  { step: "2", title: "Configura el salón", desc: "Agrega platillos, precios y número de mesas." },
  { step: "3", title: "Atiende en vivo", desc: "Meseros, cocina y caja sincronizados al instante." },
  { step: "4", title: "Analiza resultados", desc: "Revisa ventas del día y rendimiento del equipo." },
];

export default function ServiciosPage() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleSelectPlan(planId: string) {
    if (!user) {
      window.location.href = `/registro?plan=${planId}`;
      return;
    }

    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, userId: user.uid, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Error al iniciar el pago.");
        setLoadingPlan(null);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión.");
      setLoadingPlan(null);
    }
  }

  return (
    <PublicLayout>
      <section className="section" style={{ paddingTop: "3.5rem", paddingBottom: "2rem" }}>
        <div className="container">
          <div className="section__header">
            <span className="badge badge--primary" style={{ marginBottom: "0.75rem" }}>Servicios</span>
            <h1 className="section__title heading-serif" style={{ fontSize: "2.5rem" }}>
              Tecnología para tu restaurante
            </h1>
            <p className="text-muted text-lg" style={{ maxWidth: "600px", margin: "0 auto" }}>
              Digitaliza tu operación de punta a punta. Rápido, intuitivo y sin infraestructura costosa.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container">
          <div className="service-list">
            {SERVICIOS_DETALLADOS.map((serv) => (
              <div key={serv.title} className="service-row-card hover-reveal-card">
                <div className="service-row-card__icon">{serv.icon}</div>
                <div className="service-row-card__body">
                  <h3 className="service-row-card__title">{serv.title}</h3>
                  <p className="service-row-card__desc">{serv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__header">
            <span className="badge badge--success" style={{ marginBottom: "0.75rem" }}>Planes</span>
            <h2 className="section__title heading-serif" style={{ fontSize: "2rem" }}>Precios transparentes</h2>
            <p className="text-muted">Elige según el volumen de mesas. Cancela cuando quieras.</p>
          </div>

          <div className="pricing-grid">
            {DETAILED_PLANS.map((plan) => (
              <div key={plan.id} className={`pricing-card ${plan.highlighted ? "pricing-card--highlighted" : ""}`}>
                {plan.highlighted && <span className="pricing-card__badge">Recomendado</span>}
                <h3 className="pricing-card__name heading-serif">{plan.name}</h3>
                <p className="text-muted text-sm" style={{ marginBottom: "1rem" }}>{plan.description}</p>
                <div className="pricing-card__price">
                  ${plan.price}
                  <span> / {plan.period}</span>
                </div>
                <div style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", fontWeight: 600, fontSize: "0.875rem", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", marginBottom: "1.25rem", textAlign: "center" }}>
                  {plan.tableLimit}
                </div>
                <ul className="pricing-card__features">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? "primary" : "outline"}
                  block
                  size="lg"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loadingPlan !== null}
                  style={plan.highlighted ? { backgroundColor: "#e85d04", borderColor: "#e85d04" } : {}}
                >
                  {loadingPlan === plan.id ? "Procesando..." : `Elegir ${plan.name}`}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}>
        <div className="container">
          <div className="section__header">
            <h2 className="section__title heading-serif" style={{ fontSize: "2rem" }}>
              ¿Cómo trabaja Servitotal?
            </h2>
            <p className="text-muted text-lg">Cuatro pasos para digitalizar tu restaurante.</p>
          </div>
          <div className="grid grid--4" style={{ gap: "1.5rem" }}>
            {WORKFLOW_STEPS.map((s) => (
              <div key={s.step} className="card card--elevated" style={{ padding: "1.5rem" }}>
                <div style={{ width: "40px", height: "40px", background: "var(--color-primary)", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: "1rem" }}>
                  {s.step}
                </div>
                <h3 style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-secondary)" }}>{s.title}</h3>
                <p className="text-sm text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
