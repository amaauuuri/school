"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";

const INTEGRANTES = [
  {
    name: "Zaira",
    role: "UX & Producto",
    desc: "Diseño de interfaces y flujo operativo. Investigó restaurantes locales para hacer Servitotal intuitivo.",
    avatar: "👩‍💻",
    tags: ["UX/UI", "Producto"],
  },
  {
    name: "Amauri",
    role: "Arquitectura & Desarrollo",
    desc: "Arquitectura cloud con Next.js, Firestore y Stripe. Sistema rápido, seguro y en tiempo real.",
    avatar: "👨‍💻",
    tags: ["Cloud", "Frontend"],
  },
];

export default function NosotrosPage() {
  return (
    <PublicLayout>
      <section className="section" style={{ paddingTop: "3.5rem", paddingBottom: "2rem" }}>
        <div className="container">
          <div className="section__header">
            <span className="badge badge--primary" style={{ marginBottom: "0.75rem" }}>Sobre nosotros</span>
            <h1 className="section__title heading-serif" style={{ fontSize: "2.5rem" }}>
              La historia de Servitotal
            </h1>
            <p className="text-muted text-lg" style={{ maxWidth: "560px", margin: "0 auto" }}>
              Un POS nacido en el ITP para resolver la operación diaria de restaurantes.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container">
          <div className="grid grid--2" style={{ gap: "2.5rem", alignItems: "center" }}>
            <div className="square-card card card--elevated" style={{ background: "var(--color-primary-light)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🎓</div>
              <h2 className="heading-serif" style={{ fontSize: "1.5rem", color: "var(--color-secondary)", marginBottom: "0.5rem" }}>
                ITP · Puebla
              </h2>
              <p className="badge badge--warning">Negocios Electrónicos I</p>
            </div>
            <div>
              <p className="text-muted" style={{ marginBottom: "1rem" }}>
                Servitotal surgió en el <strong>Instituto Tecnológico de Puebla</strong> como proyecto de <strong>Negocios Electrónicos I</strong>, enfocado en el descontrol operativo en horas pico.
              </p>
              <p className="text-muted">
                Evolucionó de prototipo escolar a SaaS en la nube con React, Next.js y Firestore en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="square-card-grid">
            <div className="square-card card card--elevated" style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)", color: "white" }}>
              <span className="badge badge--success" style={{ marginBottom: "0.75rem" }}>Misión</span>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚀</div>
              <h2 className="heading-serif" style={{ color: "white", fontSize: "1.35rem", marginBottom: "0.75rem" }}>
                Digitalizar sin barreras
              </h2>
              <p style={{ opacity: 0.9, fontSize: "0.9375rem", lineHeight: "1.55" }}>
                Dar a restaurantes pequeños y medianos herramientas POS avanzadas, accesibles y fáciles de usar.
              </p>
            </div>

            <div className="square-card card card--elevated" style={{ background: "linear-gradient(135deg, var(--color-secondary) 0%, #2d2d44 100%)", color: "white" }}>
              <span className="badge badge--success" style={{ marginBottom: "0.75rem" }}>Visión</span>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👁️</div>
              <h2 className="heading-serif" style={{ color: "white", fontSize: "1.35rem", marginBottom: "0.75rem" }}>
                Liderar la transformación
              </h2>
              <p style={{ opacity: 0.9, fontSize: "0.9375rem", lineHeight: "1.55" }}>
                Ser el POS referente en México por agilidad, facilidad y soporte confiable.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)" }}>
        <div className="container">
          <div className="section__header">
            <span className="badge badge--neutral" style={{ marginBottom: "0.5rem" }}>Equipo</span>
            <h2 className="section__title heading-serif" style={{ fontSize: "2rem" }}>Los creadores</h2>
          </div>

          <div className="square-card-grid">
            {INTEGRANTES.map((creador) => (
              <div key={creador.name} className="square-card card card--elevated">
                <div style={{ fontSize: "2.5rem", width: "64px", height: "64px", background: "var(--color-primary-light)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
                  {creador.avatar}
                </div>
                <h3 className="heading-serif" style={{ fontSize: "1.4rem", color: "var(--color-secondary)", marginBottom: "0.25rem" }}>{creador.name}</h3>
                <p className="text-sm text-muted" style={{ fontWeight: 500, marginBottom: "0.75rem" }}>{creador.role}</p>
                <p className="text-muted text-sm" style={{ lineHeight: "1.55", flex: 1 }}>{creador.desc}</p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                  {creador.tags.map((tag) => (
                    <span key={tag} className="badge badge--neutral" style={{ fontSize: "0.75rem", textTransform: "none" }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
