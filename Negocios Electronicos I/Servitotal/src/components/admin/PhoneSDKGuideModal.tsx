"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PhoneSDKGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function PhoneSDKGuideModal({ open, onClose }: PhoneSDKGuideModalProps) {
  const [activePlatform, setActivePlatform] = useState<"web" | "ios" | "android">("web");

  return (
    <Modal open={open} onClose={onClose} title="📱 Guía de Integración SDK: Autenticación por Teléfono Celular">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxHeight: "70vh", overflowY: "auto" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          Guía técnica oficial de Firebase para habilitar y conectar la verificación SMS en clientes Web, iOS y Android.
        </p>

        {/* Platform Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>
          <button
            type="button"
            className={`btn btn--sm ${activePlatform === "web" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActivePlatform("web")}
          >
            🌐 Web SDK
          </button>
          <button
            type="button"
            className={`btn btn--sm ${activePlatform === "ios" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActivePlatform("ios")}
          >
            🍏 iOS (Swift)
          </button>
          <button
            type="button"
            className={`btn btn--sm ${activePlatform === "android" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActivePlatform("android")}
          >
            🤖 Android (Kotlin/Gradle)
          </button>
        </div>

        {/* Platform Content */}
        {activePlatform === "web" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.875rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-primary)" }}>
              Configuración e Implementación Web (Firebase Auth JS)
            </h3>
            
            <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <li>
                <strong>1. Habilitar método en Firebase Console:</strong>
                <p>Navega a Firebase Console &gt; Authentication &gt; Sign-in method y habilita el proveedor <em>Número de teléfono</em>. Configura los dominios autorizados y regiones de SMS.</p>
              </li>
              <li>
                <strong>2. Configurar el verificador reCAPTCHA:</strong>
                <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: "0.75rem", borderRadius: "6px", fontSize: "0.8rem", overflowX: "auto" }}>
{`import { getAuth, RecaptchaVerifier } from "firebase/auth";

const auth = getAuth();
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
  'size': 'invisible', // o 'normal'
  'callback': (response) => {
    // reCAPTCHA resuelto
  }
});`}
                </pre>
              </li>
              <li>
                <strong>3. Enviar código SMS (signInWithPhoneNumber):</strong>
                <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: "0.75rem", borderRadius: "6px", fontSize: "0.8rem", overflowX: "auto" }}>
{`import { signInWithPhoneNumber } from "firebase/auth";

const phoneNumber = "+525512345678";
const appVerifier = window.recaptchaVerifier;

signInWithPhoneNumber(auth, phoneNumber, appVerifier)
  .then((confirmationResult) => {
    window.confirmationResult = confirmationResult;
  })
  .catch((error) => {
    // Manejar error y resetear recaptcha
  });`}
                </pre>
              </li>
              <li>
                <strong>4. Confirmar código OTP:</strong>
                <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: "0.75rem", borderRadius: "6px", fontSize: "0.8rem", overflowX: "auto" }}>
{`confirmationResult.confirm(code).then((result) => {
  const user = result.user;
  // Usuario autenticado exitosamente
});`}
                </pre>
              </li>
            </ol>
          </div>
        )}

        {activePlatform === "ios" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.875rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-primary)" }}>
              Integración para iOS (Swift Package Manager)
            </h3>
            
            <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <li>
                <strong>1. Conectar la App al Proyecto de Firebase:</strong>
                <p>Descarga el archivo <code>GoogleService-Info.plist</code> desde Firebase console e inclúyelo en el target principal de tu proyecto Xcode.</p>
              </li>
              <li>
                <strong>2. Agregar dependencias vía Swift Package Manager:</strong>
                <p>En Xcode, dirígete a <code>File &gt; Add Packages</code> y agrega la URL del repositorio:</p>
                <code style={{ background: "rgba(0,0,0,0.06)", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                  https://github.com/firebase/firebase-ios-sdk.git
                </code>
                <p style={{ marginTop: "0.5rem" }}>Selecciona los módulos de <code>FirebaseAuth</code> y <code>FirebaseFirestore</code>.</p>
              </li>
              <li>
                <strong>3. Habilitar Notificaciones APNs / reCAPTCHA en App:</strong>
                <p>Asegúrate de configurar los certificados APNs o notificaciones silenciosas push en la consola de Apple Developer y Firebase Console.</p>
              </li>
            </ol>
          </div>
        )}

        {activePlatform === "android" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.875rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-primary)" }}>
              Integración para Android (Firebase Android BoM &amp; Gradle)
            </h3>
            
            <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <li>
                <strong>1. Agregar Firebase al proyecto Android:</strong>
                <p>Descarga e incluye el archivo <code>google-services.json</code> en el directorio <code>&lt;project&gt;/app/</code>.</p>
              </li>
              <li>
                <strong>2. Configurar Hash SHA-1:</strong>
                <p>Obtén el hash SHA-1 de tu certificado de desarrollo o release y agrégalo en la configuración de la app en Firebase console (necesario para Phone Auth y SafetyNet/Play Integrity).</p>
              </li>
              <li>
                <strong>3. Agregar dependencias en build.gradle / build.gradle.kts:</strong>
                <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: "0.75rem", borderRadius: "6px", fontSize: "0.8rem", overflowX: "auto" }}>
{`dependencies {
    // Import the BoM for the Firebase platform
    implementation(platform("com.google.firebase:firebase-bom:34.12.0"))

    // Add the dependency for the Firebase Authentication library
    implementation("com.google.firebase:firebase-auth")
}`}
                </pre>
              </li>
            </ol>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <Button variant="primary" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  );
}
