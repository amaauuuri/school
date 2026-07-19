import type { Metadata } from "next";
import { ServitotalProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";

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
      <body>
        <AuthProvider>
          <ServitotalProvider>{children}</ServitotalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
