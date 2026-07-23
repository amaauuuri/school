"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PublicLayout } from "@/components/layout/PublicLayout";

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const [status, setStatus] = useState<"loading" | "activating" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const planId = searchParams.get("planId") || "pro";
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setStatus("error");
      setErrorMsg("Debes iniciar sesión para activar tu suscripción.");
      return;
    }

    if (!sessionId) {
      setStatus("error");
      setErrorMsg("ID de sesión de pago inválido.");
      return;
    }

    async function activateSubscription() {
      setStatus("activating");
      try {
        // Update restaurant status to SUBSCRIBED
        const restaurantRef = doc(db, "restaurants", user!.uid);
        await updateDoc(restaurantRef, {
          status: "SUBSCRIBED",
          planId: planId,
          updatedAt: new Date().toISOString(),
        });

        // Update user profile
        const userRef = doc(db, "users", user!.uid);
        await updateDoc(userRef, {
          subscriptionStatus: "SUBSCRIBED",
          planId: planId,
        });

        setStatus("success");

        // Redirect after a nice delay
        setTimeout(() => {
          router.push("/dashboard/mesas");
        }, 2500);
      } catch (err: any) {
        console.error("Activation Error:", err);
        setStatus("error");
        setErrorMsg(err.message || "Error al conectar con el servidor para activar tu cuenta.");
      }
    }

    activateSubscription();
  }, [user, authLoading, sessionId, planId, router]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "70vh",
      padding: "2rem"
    }}>
      <div className="card card--elevated" style={{
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        padding: "3rem 2rem",
        borderTop: "4px solid var(--color-primary)"
      }}>
        {status === "loading" || status === "activating" ? (
          <>
            <div className="spinner" style={{
              width: "48px",
              height: "48px",
              border: "4px solid var(--color-primary-light)",
              borderTop: "4px solid var(--color-primary)",
              borderRadius: "50%",
              margin: "0 auto 1.5rem",
              animation: "spin 1s linear infinite"
            }} />
            <h2 className="heading-serif" style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Verificando pago...
            </h2>
            <p className="text-muted">
              Estamos validando tu transacción y configurando tu restaurante. Por favor, no cierres esta página.
            </p>
          </>
        ) : status === "success" ? (
          <>
            <div style={{
              fontSize: "4rem",
              color: "var(--color-success)",
              marginBottom: "1.5rem",
              animation: "scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}>
              ✓
            </div>
            <h2 className="heading-serif" style={{ fontSize: "2.25rem", color: "var(--color-secondary)", marginBottom: "1rem" }}>
              ¡Suscripción Activa!
            </h2>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              Tu restaurante ha sido activado con el plan <strong>{planId.toUpperCase()}</strong>. Serás redirigido a la consola operativa en un momento.
            </p>
            <div style={{ fontSize: "0.875rem", color: "var(--color-primary)", fontWeight: 600 }}>
              Preparando tus mesas...
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: "4rem", color: "var(--color-danger)", marginBottom: "1.5rem" }}>
              ⚠
            </div>
            <h2 className="heading-serif" style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Ups, algo salió mal
            </h2>
            <p className="text-muted" style={{ marginBottom: "2rem" }}>
              {errorMsg}
            </p>
            <button
              onClick={() => router.push("/servicios")}
              className="btn btn--primary btn--block"
            >
              Volver a Planes
            </button>
          </>
        )}
      </div>
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <PublicLayout>
      <Suspense fallback={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
          <div className="text-muted">Cargando...</div>
        </div>
      }>
        <SuccessPageContent />
      </Suspense>
    </PublicLayout>
  );
}
