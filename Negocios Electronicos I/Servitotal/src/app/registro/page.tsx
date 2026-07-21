"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/AuthContext";
import type { ConfirmationResult } from "firebase/auth";

export default function RegistroPage() {
  const router = useRouter();
  const { user, profile, signUpAdmin, sendPhoneCode, confirmPhoneCode } = useAuth();

  const [authMode, setAuthMode] = useState<"email" | "phone">("email");

  // General state
  const [name, setName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");

  // Email state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState("+52 ");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Common state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && profile) {
      if (profile.role === "ADMIN") {
        router.push("/admin/menu");
      } else {
        router.push("/dashboard/mesas");
      }
    }
  }, [user, profile, router]);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUpAdmin(name, restaurantName, email, password);
    } catch (err: any) {
      setError(err.message || "Algo salió mal. Por favor, inténtalo de nuevo.");
      setLoading(false);
    }
  }

  async function handlePhoneSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formattedPhone = phoneNumber.trim().replace(/\s+/g, "");
      if (!formattedPhone.startsWith("+")) {
        throw new Error("Ingresa el número de teléfono con código de país (ej. +52 55 1234 5678).");
      }
      const result = await sendPhoneCode(formattedPhone, "recaptcha-container-reg");
      setConfirmationResult(result);
      setLoading(false);
      setShowOtpModal(true);
    } catch (err: any) {
      setError(err.message || "No se pudo enviar el código de verificación SMS.");
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    if (!confirmationResult) return;
    setError("");
    setLoading(true);

    try {
      await confirmPhoneCode(confirmationResult, otpCode.trim(), {
        name,
        restaurantName,
      });
      setShowOtpModal(false);
    } catch (err: any) {
      setError(err.message || "Código de verificación incorrecto.");
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-card__title">Crear cuenta Partner</h1>
          <p className="auth-card__subtitle">
            Registra tu restaurante y configura tu operación en minutos.
          </p>

          {/* Mode Selector Tabs */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              background: "var(--color-bg-alt, #f3f4f6)",
              padding: "0.25rem",
              borderRadius: "var(--radius-md, 8px)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode("email");
                setError("");
              }}
              className={`btn btn--sm ${authMode === "email" ? "btn--primary" : "btn--ghost"}`}
              style={{ flex: 1 }}
            >
              ✉️ Registro Correo
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("phone");
                setError("");
              }}
              className={`btn btn--sm ${authMode === "phone" ? "btn--primary" : "btn--ghost"}`}
              style={{ flex: 1 }}
            >
              📱 Registro Teléfono
            </button>
          </div>

          {error && (
            <div
              style={{
                background: "var(--color-danger-light)",
                color: "var(--color-danger)",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.875rem",
                marginBottom: "1rem",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          {authMode === "email" ? (
            <form onSubmit={handleEmailSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    Tu nombre
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    placeholder="María González"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="restaurant">
                    Nombre del restaurante
                  </label>
                  <input
                    id="restaurant"
                    type="text"
                    className="form-input"
                    placeholder="La Cocina de María"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="contacto@restaurante.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-input"
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <Button type="submit" variant="primary" block disabled={loading}>
                  {loading ? "Creando cuenta..." : "Crear cuenta y configurar"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePhoneSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name">
                    Tu nombre
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input"
                    placeholder="María González"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-restaurant">
                    Nombre del restaurante
                  </label>
                  <input
                    id="reg-restaurant"
                    type="text"
                    className="form-input"
                    placeholder="La Cocina de María"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-phone">
                    Número Celular (con lada de país)
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    className="form-input"
                    placeholder="+52 55 1234 5678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <small style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                    Ejemplo México: +52 5512345678
                  </small>
                </div>

                {/* reCAPTCHA Container */}
                <div id="recaptcha-container-reg" style={{ margin: "0.5rem 0" }}></div>

                <Button type="submit" variant="primary" block disabled={loading}>
                  {loading ? "Enviando SMS..." : "Enviar código de verificación"}
                </Button>
              </div>
            </form>
          )}

          <div className="auth-card__divider">o</div>

          <p className="text-sm text-muted" style={{ textAlign: "center" }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" style={{ color: "var(--color-primary)" }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      <Modal
        open={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Verificación por Código SMS"
      >
        <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Hemos enviado un código SMS a <strong>{phoneNumber}</strong> para completar el registro de{" "}
            <strong>{restaurantName || "tu restaurante"}</strong>.
          </p>

          {error && (
            <div
              style={{
                background: "var(--color-danger-light)",
                color: "var(--color-danger)",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="reg-otp">
              Código SMS de 6 dígitos
            </label>
            <input
              id="reg-otp"
              type="text"
              className="form-input"
              placeholder="123456"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
              autoFocus
              style={{ letterSpacing: "0.25rem", textAlign: "center", fontSize: "1.25rem" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowOtpModal(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Completando..." : "Verificar y Crear Cuenta"}
            </Button>
          </div>
        </form>
      </Modal>
    </PublicLayout>
  );
}
