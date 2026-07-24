"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useFirestore } from "@/lib/FirestoreContext";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, profile, loading, reloadUser, resendVerificationEmail, logout } = useAuth();
  const { restaurantConfig, loadingData } = useFirestore();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // 1. Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 2. 🛡️ VERIFICACIÓN DE ACCESO REVOCADO (STATUS INACTIVE)
  useEffect(() => {
    if (!loading && user && profile) {
      const isInactive = (profile as any)?.status === "INACTIVE";
      const hasNoRestaurant = profile.role === "STAFF" && !profile.restaurantName;

      if (isInactive || hasNoRestaurant) {
        logout(); // Cierra sesión automáticamente
        router.push("/login?error=revoked");
      }
    }
  }, [user, profile, loading, logout, router]);

  // Temporizador para el cooldown de reenvío de correo
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // 3. Redirigir si un STAFF intenta entrar a rutas ADMIN
  useEffect(() => {
    if (!loading && user && requireAdmin && profile && profile.role !== "ADMIN") {
      router.push("/dashboard/mesas");
    }
  }, [user, profile, loading, requireAdmin, router]);

  // Renderizado de carga
  if (loading || (user && user.emailVerified && loadingData)) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="text-muted">Cargando aplicación...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Si el perfil está inactivo, bloqueamos el renderizado mientras efectúa el logout
  if ((profile as any)?.status === "INACTIVE") {
    return null;
  }

  // Vista de verificación de correo forzada
  if (!user.emailVerified) {
    const authCurrentUserVerified = () => {
      return user.emailVerified;
    };

    const handleCheckVerification = async () => {
      setChecking(true);
      setMessage(null);
      try {
        await reloadUser();
        if (authCurrentUserVerified()) {
          setMessage({ text: "¡Cuenta verificada! Ingresando...", type: "success" });
          window.location.reload();
        } else {
          setMessage({
            text: "El correo aún no ha sido verificado. Por favor, revisa tu bandeja de entrada.",
            type: "error",
          });
        }
      } catch (err) {
        setMessage({ text: "Error al actualizar estado. Intenta de nuevo.", type: "error" });
      } finally {
        setChecking(false);
      }
    };

    const handleResend = async () => {
      setMessage(null);
      try {
        await resendVerificationEmail();
        setMessage({ text: "Se ha reenviado el enlace de verificación.", type: "success" });
        setCooldown(60);
      } catch (err: any) {
        setMessage({ text: err.message || "No se pudo enviar el correo.", type: "error" });
      }
    };

    return (
      <div className="auth-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="auth-card" style={{ maxWidth: "480px", width: "100%" }}>
          <div style={{ fontSize: "3rem", textAlign: "center", marginBottom: "1rem" }}>✉️</div>
          <h1 className="auth-card__title" style={{ textAlign: "center" }}>Verificación de cuenta</h1>
          <p className="auth-card__subtitle" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            Hemos enviado un correo de verificación a <strong>{user.email}</strong>. Por favor, verifícalo para ingresar al sistema.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Button onClick={handleCheckVerification} variant="primary" block disabled={checking}>
              {checking ? "Verificando..." : "Ya lo verifiqué"}
            </Button>

            <Button onClick={handleResend} variant="outline" block disabled={cooldown > 0}>
              {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar correo de verificación"}
            </Button>

            <Button onClick={logout} variant="ghost" block>
              Cerrar sesión
            </Button>
          </div>

          {message && (
            <p
              style={{
                marginTop: "1.25rem",
                color: message.type === "success" ? "var(--color-success)" : "var(--color-danger)",
                fontSize: "0.875rem",
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Bloquear a usuarios STAFF en rutas de administrador
  if (requireAdmin && profile && profile.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}