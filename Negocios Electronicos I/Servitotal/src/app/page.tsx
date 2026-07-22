import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";

const FEATURES = [
  {
    icon: "🪑",
    title: "Mapa de Mesas en Tiempo Real",
    description:
      "Visualiza el estado de cada mesa: disponible, ocupada o por pagar. Tu equipo siempre sabe dónde actuar.",
  },
  {
    icon: "📋",
    title: "Toma de Órdenes Intuitiva",
    description:
      "Menú por categorías con un toque. Agrega platillos, modifica cantidades y envía a cocina al instante.",
  },
  {
    icon: "💳",
    title: "Caja Integrada",
    description:
      "Calcula totales, aplica impuestos y cierra cuentas con efectivo, tarjeta o transferencia.",
  },
  {
    icon: "📊",
    title: "Reportes y Analíticas",
    description:
      "Ventas del día, ticket promedio y platillos más vendidos para decisiones basadas en datos.",
  },
  {
    icon: "🍽️",
    title: "Gestión de Menú",
    description:
      "CRUD completo de platillos, precios, categorías y disponibilidad desde el panel admin.",
  },
  {
    icon: "☁️",
    title: "100% en la Nube",
    description:
      "Accede desde tablet, laptop o celular. Sin instalaciones, siempre actualizado.",
  },
];

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <h1 className="hero__title heading-serif">
              EL programa que tu restaurante necesita
            </h1>
            <p className="hero__subtitle">
              Servitotal centraliza mesas, órdenes, caja y reportes en una
              plataforma diseñada para la velocidad del servicio gastronómico.
            </p>
            <div className="hero__actions">
              <Link href="/registro">
                <Button variant="primary" size="lg">
                  Comenzar gratis
                </Button>
              </Link>
              <Link href="/dashboard/mesas">
                <Button variant="outline" size="lg">
                  Ver demo operativa
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
                    border: `2px solid ${n === 3
                        ? "var(--color-warning)"
                        : n === 6
                          ? "var(--color-danger)"
                          : "var(--color-success)"
                      }`,
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
            <p
              className="text-sm text-muted"
              style={{ textAlign: "center", marginTop: "1rem" }}
            >
              Vista previa del mapa de mesas
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title heading-serif">
              Todo lo que necesitas para operar
            </h2>
            <p className="text-muted text-lg">
              Desde la toma de órdenes hasta los reportes del dueño, Servitotal
              cubre cada punto del flujo operativo.
            </p>
          </div>

          <div className="grid grid--3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div className="feature-card__icon">{feature.icon}</div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section"
        style={{ background: "var(--color-secondary)", color: "white" }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="section__title heading-serif" style={{ color: "white" }}>
            ¿Listo para modernizar tu restaurante?
          </h2>
          <p
            style={{
              opacity: 0.8,
              maxWidth: 480,
              margin: "0 auto 2rem",
            }}
          >
            Únete a cientos de restaurantes que ya operan con Servitotal.
            Configura tu menú y mesas en minutos.
          </p>
          <Link href="/registro">
            <Button variant="primary" size="lg">
              Crear cuenta de Partner
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
