"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";

export default function PrivacidadPage() {
  return (
    <PublicLayout>
      <section className="section" style={{ paddingTop: "3.5rem", paddingBottom: "4rem" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="section__header" style={{ marginBottom: "2rem", textAlign: "left" }}>
            <span className="badge badge--success" style={{ marginBottom: "0.75rem" }}>Legal</span>
            <h1 className="section__title heading-serif" style={{ fontSize: "2.5rem" }}>
              Aviso de Privacidad
            </h1>
            <p className="text-muted">Última actualización: {new Date().toLocaleDateString("es-MX")}</p>
          </div>

          <div className="card card--elevated" style={{ padding: "2rem", lineHeight: "1.7" }}>
            <h3 style={{ fontWeight: 600, marginBottom: "0.75rem", color: "var(--color-secondary)" }}>
              1. Responsable de la Protección de Datos
            </h3>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              <strong>Servitotal</strong>, desarrollado como proyecto en el Instituto Tecnológico de Puebla, es responsable del tratamiento y protección de sus datos personales recolectados a través del sitio <code>servitotal.expando.mx</code>.
            </p>

            <h3 style={{ fontWeight: 600, marginBottom: "0.75rem", color: "var(--color-secondary)" }}>
              2. Datos que Recolectamos
            </h3>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              Para la prestación de nuestros servicios de punto de venta y contacto, únicamente solicitamos datos de identificación y contacto como: nombre, correo electrónico, teléfono y datos del establecimiento comercial.
            </p>

            <h3 style={{ fontWeight: 600, marginBottom: "0.75rem", color: "var(--color-secondary)" }}>
              3. Finalidad del Tratamiento
            </h3>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              Los datos recolectados se utilizan exclusivamente para: proporcionar acceso al sistema de gestión de restaurante, atender solicitudes de soporte o demostración y mejorar la experiencia de usuario.
            </p>

            <h3 style={{ fontWeight: 600, marginBottom: "0.75rem", color: "var(--color-secondary)" }}>
              4. Contacto
            </h3>
            <p className="text-muted">
              Si tiene dudas sobre este aviso de privacidad, puede contactarnos en:{" "}
              <a href="mailto:servi.tootal@gmail.com" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                servi.tootal@gmail.com
              </a>.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}