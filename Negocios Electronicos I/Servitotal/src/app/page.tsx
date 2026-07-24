"use client";

import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { RestaurantFlowAnimation } from "@/components/landing/RestaurantFlowAnimation";
import { RoleAnimatedIcon } from "@/components/landing/RoleAnimatedIcon";

const BENEFICIOS = [
  {
    icon: "⚡",
    title: "Mesas en tiempo real",
    description: "Estado de cada mesa sincronizado al instante con Firestore.",
  },
  {
    icon: "📱",
    title: "Comandas desde cualquier dispositivo",
    description: "Toma órdenes desde celular, tablet o laptop sin instalar apps.",
  },
  {
    icon: "💳",
    title: "Caja con IVA al 16%",
    description: "Totales, impuesto y cobros en efectivo, tarjeta o transferencia.",
  },
  {
    icon: "📊",
    title: "Métricas de ventas",
    description: "Ingresos por hora y platillos más vendidos en tu panel.",
  },
  {
    icon: "🛠️",
    title: "Menú personalizable",
    description: "Platillos, precios y mesas configurables para tu negocio.",
  },
  {
    icon: "👥",
    title: "Accesos por rol",
    description: "Cuentas de staff con permisos limitados a su área.",
  },
];

const ROLES_FLUX = [
  {
    role: "comensal" as const,
    label: "Comensal",
    title: "Servicio rápido y sin esperas",
    description: "La orden llega al instante y el platillo se sirve a tiempo.",
  },
  {
    role: "mesero" as const,
    label: "Mesero",
    title: "Comandas con un toque",
    description: "Registra pedidos desde el móvil y envíalos directo a cocina.",
  },
  {
    role: "caja" as const,
    label: "Caja",
    title: "Cobros ágiles con IVA incluido",
    description: "Cuentas actualizadas al segundo con el 16% de IVA automático.",
  },
  {
    role: "dueno" as const,
    label: "Dueño",
    title: "Visión total del negocio",
    description: "Supervisa ventas, staff y operación desde cualquier lugar.",
  },
];

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="hero" style={{ padding: "5rem 0" }}>
        <div className="container hero__grid">
          <div>
            <span className="badge badge--primary" style={{ marginBottom: "1rem" }}>
              POS para restaurantes modernos
            </span>
            <h1 className="hero__title heading-serif" style={{ fontSize: "2.75rem", lineHeight: "1.2" }}>
              El sistema que acelera tu restaurante
            </h1>
            <p className="hero__subtitle">
              Conecta órdenes, caja y administración en tiempo real. Diseñado para horas pico.
            </p>
            <div className="hero__actions">
              <Link href="/registro">
                <Button variant="primary" size="lg">Comenzar ahora</Button>
              </Link>
              <Link href="/servicios">
                <Button variant="outline" size="lg">Ver planes</Button>
              </Link>
            </div>
          </div>
          <div style={{ width: "100%" }}>
            <RestaurantFlowAnimation />
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container">
          <div className="section__header">
            <span className="badge badge--neutral" style={{ marginBottom: "0.5rem" }}>Roles del sistema</span>
            <h2 className="section__title heading-serif">Una herramienta, múltiples soluciones</h2>
            <p className="text-muted text-lg">
              Cada rol tiene lo que necesita para operar con fluidez.
            </p>
          </div>

          <div className="roles-grid">
            {ROLES_FLUX.map((item) => (
              <div key={item.role} className="role-card">
                <div className="role-card__icon">
                  <RoleAnimatedIcon role={item.role} />
                </div>
                <div className="role-card__body">
                  <span className="badge role-card__badge">{item.label}</span>
                  <h3 className="role-card__title heading-serif">{item.title}</h3>
                  <p className="role-card__desc text-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title heading-serif">Funcionalidades clave</h2>
            <p className="text-muted text-lg">
              Todo lo necesario para operar y vender más.
            </p>
          </div>
          <div className="benefits-alternating">
            {BENEFICIOS.map((b, i) => (
              <div
                key={b.title}
                className={`benefits-alternating__row benefits-alternating__row--${i % 2 === 0 ? "left" : "right"}`}
              >
                <div className="feature-card hover-reveal-card">
                  <div className="feature-card__icon">{b.icon}</div>
                  <h3 className="feature-card__title">{b.title}</h3>
                  <p className="feature-card__desc">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section"
        style={{
          background: "linear-gradient(135deg, var(--color-secondary) 0%, #2d2d44 100%)",
          color: "white",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="container" style={{ textAlign: "center", padding: "2rem 0" }}>
          <span className="badge badge--warning" style={{ marginBottom: "1rem" }}>Origen escolar · ITP</span>
          <h2 className="section__title heading-serif" style={{ color: "white", fontSize: "2.25rem" }}>
            Detrás de Servitotal
          </h2>
          <p style={{ opacity: 0.9, maxWidth: 560, margin: "0 auto 2rem", lineHeight: "1.6", fontSize: "1.0625rem" }}>
            Proyecto de <strong>Negocios Electrónicos I</strong> en el <strong>ITP</strong>, creado por Zaira y Amauri para digitalizar restaurantes.
          </p>
          <Link href="/nosotros">
            <Button variant="primary" size="lg" style={{ backgroundColor: "#e85d04", borderColor: "#e85d04" }}>
              Conoce al equipo
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}