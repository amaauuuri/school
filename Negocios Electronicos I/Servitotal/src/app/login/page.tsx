"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/AuthContext";
import type { ConfirmationResult } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, signIn, sendPhoneCode, confirmPhoneCode } = useAuth();
  
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  
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
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || "Algo salió mal. Por favor, inténtalo de nuevo.");
      setLoading(false);
    }
  }

  async function handleSendSms(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formattedPhone = phoneNumber.trim().replace(/\s+/g, "");
      if (!formattedPhone.startsWith("+")) {
        throw new Error("Ingresa el número de teléfono con código de país (ej. +52 55 1234 5678).");
      }
      const result = await sendPhoneCode(formattedPhone, "recaptcha-container");
      setConfirmationResult(result);
      setLoading(false);
      setShowOtpModal(true);
    } catch (err: any) {
      setError(err.message || "No se pudo enviar el código SMS. Revisa el número de teléfono.");
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    if (!confirmationResult) return;
    setError("");
    setLoading(true);

    try {
      await confirmPhoneCode(confirmationResult, otpCode.trim());
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
          <h1 className="auth-card__title">Iniciar sesión</h1>
          <p className="auth-card__subtitle">
            Accede al panel de tu restaurante Servitotal.
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
              ✉️ Correo
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
              📱 Teléfono / SMS
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
                  <label className="form-label" htmlFor="email">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="tu@restaurante.com"
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <Button type="submit" variant="primary" block disabled={loading}>
                  {loading ? "Iniciando sesión..." : "Entrar al panel"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSendSms}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Número Celular (con lada de país)
                  </label>
                  <input
                    id="phone"
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

                {/* Container element for Firebase reCAPTCHA */}
                <div id="recaptcha-container" style={{ margin: "0.5rem 0" }}></div>

                <Button type="submit" variant="primary" block disabled={loading}>
                  {loading ? "Enviando SMS..." : "Enviar código de verificación"}
                </Button>
              </div>
            </form>
          )}

          <div className="auth-card__divider">o</div>

          <p className="text-sm text-muted" style={{ textAlign: "center" }}>
            ¿No tienes cuenta?{" "}
            <Link href="/registro" style={{ color: "var(--color-primary)" }}>
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>

      {/* Custom Modal for OTP Code Input */}
      <Modal
        open={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Verificación por Código SMS"
      >
        <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Hemos enviado un código SMS de 6 dígitos al número <strong>{phoneNumber}</strong>.
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
            <label className="form-label" htmlFor="otp">
              Código SMS de 6 dígitos
            </label>
            <input
              id="otp"
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
              {loading ? "Verificando..." : "Confirmar y Entrar"}
            </Button>
          </div>
        </form>
      </Modal>
    </PublicLayout>
  );
}
