"use client";

import { FormEvent, useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

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
      {/* Hero Section */}
      <section className="section" style={{ paddingTop: "3.5rem", paddingBottom: "2rem" }}>
        <div className="container">
          <div className="section__header">
            <span className="badge badge--success" style={{ marginBottom: "0.75rem" }}>
              Nuestra Historia y Contacto
            </span>
            <h1 className="section__title heading-serif" style={{ fontSize: "2.75rem" }}>
              Servitotal: Innovación gastronómica hecha por estudiantes
            </h1>
            <p className="text-muted text-lg" style={{ maxWidth: "720px", margin: "0 auto" }}>
              Conoce la historia detrás de Servitotal y ponte en contacto directo con nuestro equipo de desarrollo.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section: Zaira & Amauri */}
      <section className="section" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container">
          <div className="grid grid--2" style={{ alignItems: "center", gap: "2.5rem" }}>
            <div>
              <span className="badge badge--warning" style={{ marginBottom: "1rem" }}>
                Fundadores y Desarrolladores
              </span>
              <h2 className="heading-serif" style={{ fontSize: "2.25rem", marginBottom: "1.25rem" }}>
                La historia de Zaira & Amauri
              </h2>
              <p className="text-muted" style={{ marginBottom: "1rem", lineHeight: "1.7" }}>
                Servitotal nació en las aulas universitarias cuando <strong>Zaira</strong> y <strong>Amauri</strong>, dos estudiantes apasionados por la tecnología y los negocios electrónicos, observaron de primera mano los problemas cotidianos que enfrentan los restaurantes locales: comandas extraviadas, errores al cobrar y falta de visibilidad en tiempo real entre la cocina y los meseros.
              </p>
              <p className="text-muted" style={{ marginBottom: "1.5rem", lineHeight: "1.7" }}>
                Combinando diseño moderno, arquitectura en la nube con Firebase y un enfoque centrado en la velocidad operativa, creamos una plataforma POS potente, intuitiva y accesible que permite a cualquier negocio gastronómico digitalizar su restaurante en cuestión de minutos.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="card card--elevated" style={{ padding: "1rem" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>👩‍💻</div>
                  <h4 style={{ fontWeight: 600 }}>Zaira</h4>
                  <p className="text-sm text-muted">Co-fundadora · Experiencia de Usuario & Producto</p>
                </div>
                <div className="card card--elevated" style={{ padding: "1rem" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>👨‍💻</div>
                  <h4 style={{ fontWeight: 600 }}>Amauri</h4>
                  <p className="text-sm text-muted">Co-fundador · Arquitectura & Desarrollo de Software</p>
                </div>
              </div>
            </div>

            <div className="card card--elevated" style={{ padding: "2rem", background: "linear-gradient(135deg, var(--color-secondary) 0%, #2d2d44 100%)", color: "white" }}>
              <h3 className="heading-serif" style={{ color: "white", fontSize: "1.75rem", marginBottom: "1rem" }}>
                Nuestra Misión
              </h3>
              <p style={{ opacity: 0.9, lineHeight: "1.7", marginBottom: "1.5rem" }}>
                Democratizar la tecnología de punta para restaurantes de cualquier tamaño. Queremos que los meseros atiendan con agilidad, los cocineros reciban órdenes sin retraso y los dueños tengan control total desde su teléfono o computadora.
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9375rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "var(--color-primary)" }}>✓</span> Sincronización en tiempo real con Firebase
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "var(--color-primary)" }}>✓</span> 100% responsivo para celular, tablet y laptop
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "var(--color-primary)" }}>✓</span> Soporte directo y cercano con los creadores
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Cards & Form */}
      <section className="section">
        <div className="container">
          <div className="grid grid--2" style={{ gap: "2.5rem" }}>
            {/* Contact Info Card */}
            <div>
              <h2 className="heading-serif" style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                Ponte en contacto
              </h2>
              <p className="text-muted" style={{ marginBottom: "2rem" }}>
                ¿Tienes dudas sobre los planes, necesitas una demostración personalizada o deseas soporte para tu restaurante? Estamos a un mensaje de distancia.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ fontSize: "2rem", width: "48px", height: "48px", background: "var(--color-primary-light)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    ✉️
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>Correo Electrónico Oficial</h4>
                    <a href="mailto:servi.tootal@gmail.com" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                      servi.tootal@gmail.com
                    </a>
                  </div>
                </div>

                <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ fontSize: "2rem", width: "48px", height: "48px", background: "var(--color-success-light)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    💬
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>Atención y Soporte</h4>
                    <p className="text-sm text-muted">Lunes a Sábado de 9:00 AM a 7:00 PM</p>
                  </div>
                </div>

                <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ fontSize: "2rem", width: "48px", height: "48px", background: "var(--color-warning-light)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    🎓
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>Proyecto Universitario</h4>
                    <p className="text-sm text-muted">Materia de Negocios Electrónicos I</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="card card--elevated" style={{ padding: "2rem" }}>
              <h3 style={{ fontWeight: 600, marginBottom: "1.25rem" }}>Envíanos un mensaje</h3>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contactName">Tu Nombre</label>
                    <input
                      id="contactName"
                      type="text"
                      className="form-input"
                      placeholder="Ana Martínez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={sending}
                    />
                  </div>

                  <div className="form-row form-row--2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="contactEmail">Correo electrónico</label>
                      <input
                        id="contactEmail"
                        type="email"
                        className="form-input"
                        placeholder="ana@restaurante.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={sending}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="contactPhone">Teléfono</label>
                      <input
                        id="contactPhone"
                        type="tel"
                        className="form-input"
                        placeholder="5512345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={sending}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contactRestaurant">Nombre del restaurante (opcional)</label>
                    <input
                      id="contactRestaurant"
                      type="text"
                      className="form-input"
                      placeholder="Café Central"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      disabled={sending}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contactMessage">¿En qué podemos ayudarte?</label>
                    <textarea
                      id="contactMessage"
                      className="form-textarea"
                      placeholder="Cuéntanos sobre tu negocio o las preguntas que tengas..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      disabled={sending}
                    />
                  </div>

                  <Button type="submit" variant="primary" block disabled={sending}>
                    {sending ? "Enviando mensaje..." : "Enviar mensaje"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Modal (Zero Browser Alert) */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="¡Mensaje Enviado con Éxito!"
        footer={
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Entendido
          </Button>
        }
      >
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎉</div>
          <p style={{ fontWeight: 600, fontSize: "1.125rem", marginBottom: "0.5rem" }}>
            Gracias por escribirnos
          </p>
          <p className="text-sm text-muted">
            Hemos recibido tu mensaje. Zaira o Amauri te responderán al correo <strong>servi.tootal@gmail.com</strong> lo antes posible.
          </p>
        </div>
      </Modal>
    </PublicLayout>
  );
}
