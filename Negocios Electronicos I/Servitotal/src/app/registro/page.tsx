"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, Suspense } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";

function RegistroPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  const { user, profile, signUpAdmin, signInWithGoogle } = useAuth();
  
  const [name, setName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutTriggered, setCheckoutTriggered] = useState(false);

  useEffect(() => {
    if (user && profile) {
      if (plan && !checkoutTriggered) {
        setCheckoutTriggered(true);
        setLoading(true);
        
        // Trigger Stripe Checkout
        fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: plan,
            userId: user.uid,
            userEmail: user.email,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.url) {
              window.location.href = data.url;
            } else {
              setError(data.error || "Error al iniciar Stripe Checkout.");
              setLoading(false);
            }
          })
          .catch((err) => {
            console.error(err);
            setError("Error de red al conectar con Stripe.");
            setLoading(false);
          });
      } else if (!plan) {
        if (profile.role === "ADMIN") {
          router.push("/admin/menu");
        } else {
          router.push("/dashboard/mesas");
        }
      }
    }
  }, [user, profile, plan, checkoutTriggered, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUpAdmin(name, restaurantName, email, password, phone);
    } catch (err: any) {
      setError(err.message || "Algo salió mal. Por favor, inténtalo de nuevo.");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "No se pudo completar el registro con Google.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Crear cuenta Partner</h1>
        <p className="auth-card__subtitle">
          Registra tu restaurante y configura tu operación en minutos.
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

            <div className="form-row form-row--2">
              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Teléfono celular
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  placeholder="5512345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
              {loading ? "Procesando..." : "Crear cuenta y configurar"}
            </Button>
          </div>
        </form>

        <div className="auth-card__divider">o</div>

        <Button
          type="button"
          variant="outline"
          block
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Registrarse con Google
        </Button>

        <p className="text-sm text-muted" style={{ textAlign: "center", marginTop: "1.5rem" }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <PublicLayout>
      <Suspense fallback={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div className="text-muted">Cargando formulario...</div>
        </div>
      }>
        <RegistroPageContent />
      </Suspense>
    </PublicLayout>
  );
}
