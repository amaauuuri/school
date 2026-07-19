"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  async function handleSubmit(e: FormEvent) {
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

  return (
    <PublicLayout>
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-card__title">Iniciar sesión</h1>
          <p className="auth-card__subtitle">
            Accede al panel de tu restaurante como Partner.
          </p>

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

          <form onSubmit={handleSubmit}>
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

          <div className="auth-card__divider">o</div>

          <p className="text-sm text-muted" style={{ textAlign: "center" }}>
            ¿No tienes cuenta?{" "}
            <Link href="/registro" style={{ color: "var(--color-primary)" }}>
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
