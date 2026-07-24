import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ServitotalProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/AuthContext";
import { FirestoreProvider } from "@/lib/FirestoreContext";
import "./globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      {/* 🟢 Agregamos <head> explícito para la preconexión de imágenes */}
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://picsum.photos" crossOrigin="anonymous" />
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