"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // 1. Redirigir al login si no hay sesión activa
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 2. Verificación de acceso revocado
  useEffect(() => {
    if (!loading && user && profile) {
      const isInactive = (profile as any)?.status === "INACTIVE";
      const hasNoRestaurant = profile.role === "STAFF" && !profile.restaurantName;

      if (isInactive || hasNoRestaurant) {
        logout();
        router.push("/login?error=revoked");
      }
    }
  }, [user, profile, loading, logout, router]);

  // 🟢 3. INTERCEPTOR ESTRICTO DE FLUJO: Correo Verificado -> /servicio (Pagar) -> Admin/Dashboard
  useEffect(() => {
    if (!loading && user && !loadingData && profile) {
      if ((profile as any)?.status === "INACTIVE") return;

      // PASO 2 Y 3: Si el correo YA fue verificado, pero NO ha pagado en Stripe Sandbox
      if (user.emailVerified && profile.role === "ADMIN") {
        const isSubscribed = (restaurantConfig as any)?.status === "SUBSCRIBED";

        if (!isSubscribed && pathname !== "/servicio") {
          // Bloquea el acceso al dashboard y lo manda directamente a elegir su plan en /servicio
          router.push("/servicio");
        }
      }
    }
  }, [user, profile, loading, restaurantConfig, loadingData, pathname, router]);

  // 4. Bloquear a usuarios STAFF en rutas ADMIN
  useEffect(() => {
    if (!loading && user && requireAdmin && profile && profile.role !== "ADMIN") {
      router.push("/dashboard/mesas");
    }
  }, [user, profile, loading, requireAdmin, router]);

  // Pantalla de carga universal mientras se resuelve la sesión de Firebase
  if (loading || (user && user.emailVerified && loadingData)) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="text-muted">Cargando aplicación...</div>
      </div>
    );
  }

  if (!user) return null;
  if ((profile as any)?.status === "INACTIVE") return null;

  // 🔴 PASO 2 DEL PLAN: Si el correo NO ha sido verificado, MOSTRAR OBLIGATORIAMENTE la pantalla de verificación.
  if (!user.emailVerified) {
    const handleCheckVerification = async () => {
      setChecking(true);
      setMessage(null);
      try {
        await reloadUser();
        if (user.emailVerified) {
          setMessage({ text: "¡Correo verificado con éxito! Redirigiendo a selección de plan...", type: "success" });
          setTimeout(() => {
            router.push("/servicio");
          }, 1000);
        } else {
          setMessage({
            text: "El correo aún no ha sido verificado. Por favor revisa tu bandeja o correo no deseado.",
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
          <h1 className="auth-card__title" style={{ textAlign: "center" }}>Verificación de correo requerida</h1>
          <p className="auth-card__subtitle" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            Hemos enviado un correo a <strong>{user.email}</strong>. Por favor verifícalo para continuar con la elección de tu plan.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Button onClick={handleCheckVerification} variant="primary" block disabled={checking}>
              {checking ? "Verificando..." : "Ya lo verifiqué"}
            </Button>

            <Button onClick={handleResend} variant="outline" block disabled={cooldown > 0}>
              {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar correo"}
            </Button>

            <Button onClick={logout} variant="ghost" block>
              Cerrar sesión
            </Button>
          </div>

          {message && (
            <p style={{ marginTop: "1.25rem", color: message.type === "success" ? "var(--color-success)" : "var(--color-danger)", fontSize: "0.875rem", textAlign: "center", fontWeight: 500 }}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 🔴 PASO 3 Y 4 DEL PLAN: Si el usuario ya verificó su correo pero NO está suscrito, bloquear cualquier pantalla de admin y mandarlo a /servicio
  const isSubscribed = (restaurantConfig as any)?.status === "SUBSCRIBED";
  if (profile?.role === "ADMIN" && !isSubscribed && pathname !== "/servicio") {
    return null;
  }

  return <>{children}</>;
}