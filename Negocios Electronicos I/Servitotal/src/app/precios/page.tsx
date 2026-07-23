"use client";

import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";

const DETAILED_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 499,
    period: "mes",
    description: "Ideal para cafeterías, food trucks y pequeños restaurantes.",
    tableLimit: "Hasta 8 mesas activas",
    features: [
      "Límite de hasta 8 mesas",
      "Menú y categorías ilimitados",
      "Sincronización en tiempo real con Firestore",
      "IVA fijo al 16% automatizado",
      "Caja integrada (Efectivo, Tarjeta, Transferencia)",
      "Soporte técnico por correo",
    ],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 899,
    period: "mes",
    description: "El plan favorito para restaurantes medianos en constante crecimiento.",
    tableLimit: "Hasta 25 mesas activas",
    features: [
      "Límite de hasta 25 mesas",
      "Cuentas de personal (STAFF) ilimitadas",
      "Panel de reportes en tiempo real",
      "Gestión de personal desde Configuración",
      "Sincronización multi-dispositivo instantánea",
      "Soporte prioritario 7 días a la semana",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 1499,
    period: "mes",
    description: "Para cadenas de restaurantes y salones de gran volumen operativo.",
    tableLimit: "Hasta 50 mesas activas",
    features: [
      "Límite expandido de hasta 50 mesas",
      "Acceso de administración y staff ilimitado",
      "Historial de ventas y reportes avanzados",
      "Capacidad de conexión para apps móviles de clientes",
      "Reglas de seguridad Firestore de grado comercial",
      "Atención personalizada con Zaira & Amauri",
    ],
    highlighted: false,
  },
];

const WORKFLOW_STEPS = [
  {
    step: "1",
    title: "Registra tu restaurante",
    desc: "Crea tu cuenta de Partner en menos de un minuto con tu teléfono o correo.",
  },
  {
    step: "2",
    title: "Configura tu menú y mesas",
    desc: "Ingresa tus platillos, precios y ajusta el número de mesas según las capacidades de tu suscripción.",
  },
  {
    step: "3",
    title: "Operación en tiempo real",
    desc: "Tus meseros toman comandas desde cualquier celular o tablet y la caja recibe el cobro con IVA (16%) al instante.",
  },
  {
    step: "4",
    title: "Analiza tus resultados",
    desc: "Consulta métricas de ventas por hora y platillos más vendidos desde el panel de administración.",
  },
];

export default function PreciosPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="section" style={{ paddingTop: "3.5rem", paddingBottom: "2rem" }}>
        <div className="container">
          <div className="section__header">
            <span className="badge badge--primary" style={{ marginBottom: "0.75rem" }}>
              Planes y Servicios Detallados
            </span>
            <h1 className="section__title heading-serif" style={{ fontSize: "2.75rem" }}>
              Planes transparentes adaptados a tu operación
            </h1>
            <p className="text-muted text-lg" style={{ maxWidth: "720px", margin: "0 auto" }}>
              Sin cobros ocultos ni configuraciones complicadas. Elige el plan con el número de mesas que tu restaurante necesita.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="pricing-grid">
            {DETAILED_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`pricing-card ${plan.highlighted ? "pricing-card--highlighted" : ""}`}
              >
                {plan.highlighted && (
                  <span className="pricing-card__badge">Recomendado</span>
                )}
                <h2 className="pricing-card__name">{plan.name}</h2>
                <p className="text-muted text-sm" style={{ marginBottom: "1rem" }}>
                  {plan.description}
                </p>
                <div className="pricing-card__price">
                  ${plan.price}
                  <span> / {plan.period}</span>
                </div>
                <div
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "1rem",
                    textAlign: "center",
                  }}
                >
                  📌 {plan.tableLimit}
                </div>
                <ul className="pricing-card__features">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link href="/registro">
                  <Button variant={plan.highlighted ? "primary" : "outline"} block size="lg">
                    Comenzar con {plan.name}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operational Workflow Explanation */}
      <section className="section" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}>
        <div className="container">
          <div className="section__header">
            <h2 className="section__title heading-serif" style={{ fontSize: "2.25rem" }}>
              ¿Cómo trabaja Servitotal en tu restaurante?
            </h2>
            <p className="text-muted text-lg">
              Un flujo pensado para agilizar el servicio y eliminar errores en cada mesa.
            </p>
          </div>

          <div className="grid grid--4" style={{ gap: "1.5rem" }}>
            {WORKFLOW_STEPS.map((s) => (
              <div key={s.step} className="card card--elevated" style={{ position: "relative", padding: "1.5rem" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--color-primary)",
                    color: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    marginBottom: "1rem",
                  }}
                >
                  {s.step}
                </div>
                <h3 style={{ fontWeight: 600, fontSize: "1.125rem", marginBottom: "0.5rem" }}>
                  {s.title}
                </h3>
                <p className="text-sm text-muted" style={{ lineHeight: "1.6" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
