"use client";

import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";

const BENEFICIOS = [
  {
    icon: "⚡",
    title: "Mesas Ocupadas y Por Pagar en Tiempo Real",
    description:
      "Toda tu plantilla ve instantáneamente el estado de cada mesa gracias a la sincronización en tiempo real con Firebase Firestore.",
  },
  {
    icon: "📱",
    title: "Toma de Comandas desde Cualquier Dispositivo",
    description:
      "Tus meseros pueden usar su teléfono celular, tablet o laptop sin necesidad de instalar aplicaciones pesadas.",
  },
  {
    icon: "💳",
    title: "Cobro Ágil en Caja con IVA (16%) Automatizado",
    description:
      "Calcula totales al instante, aplica el 16% de IVA y registra pagos en efectivo, tarjeta o transferencia.",
  },
  {
    icon: "📊",
    title: "Métricas de Ventas y Platillos Más Vendidos",
    description:
      "Toma decisiones estratégicas consultando tus ingresos por hora y el rendimiento diario de tu cocina.",
  },
  {
    icon: "🛠️",
    title: "Configuración y Menú Limpio a tu Medida",
    description:
      "Agrega tus propios platillos, precios y mesas sin textos de prueba prellenados. Tú tienes el control total.",
  },
  {
    icon: "👥",
    title: "Gestión de Personal con Accesos Seguros",
    description:
      "Crea cuentas para tu staff con roles delimitados para que el personal operativo sólo acceda a la toma de órdenes.",
  },
];

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <span className="badge badge--primary" style={{ marginBottom: "1rem" }}>
              El POS ideal para restaurantes modernos
            </span>
            <h1 className="hero__title heading-serif" style={{ fontSize: "3rem", lineHeight: "1.15" }}>
              El sistema inteligente que acelera tu restaurante
            </h1>
            <p className="hero__subtitle">
              Servitotal conecta la toma de órdenes, la caja y la administración en tiempo real. Diseñado para ofrecer máxima velocidad en horas pico.
            </p>
            <div className="hero__actions">
              <Link href="/registro">
                <Button variant="primary" size="lg">
                  Comenzar ahora
                </Button>
              </Link>
              <Link href="/precios">
                <Button variant="outline" size="lg">
                  Ver planes y servicios
                </Button>
              </Link>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__mock-dashboard">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <div
                  key={n}
                  className="hero__mock-table"
                  style={{
                    background:
                      n === 3
                        ? "var(--color-warning-light)"
                        : n === 6
                          ? "var(--color-danger-light)"
                          : "var(--color-success-light)",
                    border: `2px solid ${
                      n === 3
                        ? "var(--color-warning)"
                        : n === 6
                          ? "var(--color-danger)"
                          : "var(--color-success)"
                    }`,
                  }}
                >
                  Mesa {n}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted" style={{ textAlign: "center", marginTop: "1rem" }}>
              Mapa dinámico de mesas en tiempo real
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title heading-serif">
              Beneficios de transformar tu operación con Servitotal
            </h2>
            <p className="text-muted text-lg">
              Diseñado por Zaira & Amauri para eliminar la fricción en el servicio de restaurante.
            </p>
          </div>

          <div className="grid grid--3">
            {BENEFICIOS.map((b) => (
              <div key={b.title} className="feature-card">
                <div className="feature-card__icon">{b.icon}</div>
                <h3 className="feature-card__title">{b.title}</h3>
                <p className="feature-card__desc">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Story Teaser */}
      <section
        className="section"
        style={{
          background: "linear-gradient(135deg, var(--color-secondary) 0%, #2d2d44 100%)",
          color: "white",
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <span className="badge badge--warning" style={{ marginBottom: "1rem" }}>
            Conoce la Historia
          </span>
          <h2 className="section__title heading-serif" style={{ color: "white", fontSize: "2.5rem" }}>
            Desarrollado por Zaira & Amauri
          </h2>
          <p
            style={{
              opacity: 0.9,
              maxWidth: 600,
              margin: "0 auto 2rem",
              lineHeight: "1.7",
              fontSize: "1.125rem",
            }}
          >
            Servitotal nació como un proyecto universitario enfocado en crear una plataforma de gestión gastronómica accesible, moderna y ultra rápida.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/contacto">
              <Button variant="primary" size="lg">
                Conocer la historia y contactarnos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
