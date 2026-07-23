"use client";

import { FormEvent, useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const ITP_MAP_EMBED =
  "https://maps.google.com/maps?q=Instituto+Tecnol%C3%B3gico+de+Puebla,+Av.+Tecnol%C3%B3gico+725,+Puebla&hl=es&z=16&output=embed";

export default function ContactoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setShowModal(true);
      setName("");
      setEmail("");
      setPhone("");
      setRestaurantName("");
      setMessage("");
    }, 1000);
  }

  return (
    <PublicLayout>
      <section className="section" style={{ paddingTop: "3.5rem", paddingBottom: "2rem" }}>
        <div className="container">
          <div className="section__header" style={{ marginBottom: "1.5rem" }}>
            <span className="badge badge--success" style={{ marginBottom: "0.75rem" }}>Contacto</span>
            <h1 className="section__title heading-serif" style={{ fontSize: "2.5rem" }}>
              Escríbenos
            </h1>
            <p className="text-muted text-lg" style={{ maxWidth: "480px", margin: "0 auto" }}>
              Demostración, soporte o dudas sobre el proyecto.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}>
        <div className="container">
          <div className="grid grid--2" style={{ gap: "2.5rem", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="card card--elevated" style={{ padding: "0", overflow: "hidden" }}>
                <div style={{ padding: "1.25rem 1.5rem 0.75rem" }}>
                  <h2 className="heading-serif" style={{ fontSize: "1.35rem", marginBottom: "0.35rem", color: "var(--color-secondary)" }}>
                    Instituto Tecnológico de Puebla
                  </h2>
                  <p className="text-sm text-muted">Sede de desarrollo del proyecto</p>
                </div>
                <iframe
                  className="map-embed"
                  src={ITP_MAP_EMBED}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación del ITP en Google Maps"
                />
                <div style={{ padding: "1rem 1.5rem 1.25rem" }}>
                  <p className="text-sm text-muted" style={{ lineHeight: "1.55", marginBottom: "0.75rem" }}>
                    Agradecemos al <strong>ITP</strong> y a <strong>Negocios Electrónicos I</strong> por el espacio y la mentoría para crear Servitotal.
                  </p>
                  <a href="https://maps.app.goo.gl/4L9Ptu3j7zqTrnVTA" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" block size="sm">Abrir en Google Maps</Button>
                  </a>
                </div>
              </div>

              <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem" }}>
                <div style={{ fontSize: "1.5rem", width: "44px", height: "44px", background: "var(--color-primary-light)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✉️
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, color: "var(--color-secondary)" }}>Correo</h4>
                  <a href="mailto:servi.tootal@gmail.com" style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.9375rem" }}>
                    servi.tootal@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="card card--elevated" style={{ padding: "2rem" }}>
              <h3 style={{ fontWeight: 600, marginBottom: "1.25rem", color: "var(--color-secondary)" }}>Envíanos un mensaje</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contactName">Nombre</label>
                    <input id="contactName" type="text" className="form-input" placeholder="Ana Martínez" value={name} onChange={(e) => setName(e.target.value)} required disabled={sending} />
                  </div>
                  <div className="form-row form-row--2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="contactEmail">Correo</label>
                      <input id="contactEmail" type="email" className="form-input" placeholder="ana@restaurante.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={sending} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="contactPhone">Teléfono</label>
                      <input id="contactPhone" type="tel" className="form-input" placeholder="5512345678" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={sending} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contactRestaurant">Restaurante (opcional)</label>
                    <input id="contactRestaurant" type="text" className="form-input" placeholder="Café Central" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} disabled={sending} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contactMessage">Mensaje</label>
                    <textarea id="contactMessage" className="form-textarea" placeholder="Tu mensaje..." value={message} onChange={(e) => setMessage(e.target.value)} required disabled={sending} />
                  </div>
                  <Button type="submit" variant="primary" block disabled={sending} style={{ backgroundColor: "#e85d04", borderColor: "#e85d04" }}>
                    {sending ? "Enviando..." : "Enviar mensaje"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Mensaje enviado"
        footer={
          <Button variant="primary" onClick={() => setShowModal(false)} style={{ backgroundColor: "#e85d04", borderColor: "#e85d04" }}>
            Entendido
          </Button>
        }
      >
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎉</div>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>¡Gracias por escribirnos!</p>
          <p className="text-sm text-muted">Te responderemos pronto a tu correo.</p>
        </div>
      </Modal>
    </PublicLayout>
  );
}
