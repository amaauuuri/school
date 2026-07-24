import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ServitotalProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/AuthContext";
import { FirestoreProvider } from "@/lib/FirestoreContext";
import "./globals.css";

// 🟢 Carga optimizada de fuente local/SSR (cero peticiones externas en tiempo de ejecución)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Servitotal — POS para Restaurantes",
  description:
    "SaaS de gestión y punto de venta para restaurantes. Mesas, órdenes, caja y reportes en un solo lugar.",
};

// En src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* 🟢 Preconexiones prioritarias que resuelven el Render-Blocking en celular */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <FirestoreProvider>
            <ServitotalProvider>{children}</ServitotalProvider>
          </FirestoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}