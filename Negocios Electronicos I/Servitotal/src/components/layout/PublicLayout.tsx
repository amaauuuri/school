"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/nosotros", label: "Sobre Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile } = useAuth();

  // Dinámicamente a /dashboard (que redirige a /dashboard/mesas) o /admin/menu si es Admin, o a /login
  const consoleLink = user ? (profile?.role === "ADMIN" ? "/admin/menu" : "/dashboard") : "/login";

  return (
    <header className="public-header">
      <div className="container public-header__inner">
        <Link href="/" className="public-header__logo">
          <span className="public-header__logo-icon">S</span>
          Servitotal
        </Link>

        {/* Desktop Navigation */}
        <nav className="public-nav">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`public-nav__link ${
                pathname === link.href ? "public-nav__link--active" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="public-header__actions">
          <Link href={consoleLink}>
            <Button
              variant="primary"
              style={{
                backgroundColor: "#e85d04",
                borderColor: "#e85d04",
                fontWeight: 600,
              }}
            >
              Consola
            </Button>
          </Link>
          
          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="mobile-burger-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu with smooth CSS transitions */}
      <div className={`public-mobile-drawer ${mobileOpen ? "public-mobile-drawer--open" : ""}`}>
        <nav className="public-mobile-nav">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`public-mobile-nav__link ${
                pathname === link.href ? "public-mobile-nav__link--active" : ""
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr style={{ borderColor: "var(--color-border)", margin: "1rem 0" }} />
          <Link href={consoleLink} onClick={() => setMobileOpen(false)}>
            <Button
              variant="primary"
              block
              style={{
                backgroundColor: "#e85d04",
                borderColor: "#e85d04",
              }}
            >
              Consola
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container">
        <div className="public-footer__grid">
          <div className="public-footer__brand">
            <div className="public-header__logo">
              <span className="public-header__logo-icon" style={{ color: "white" }}>S</span>
              <span style={{ color: "white" }}>Servitotal</span>
            </div>
            <p style={{ marginTop: "1rem", opacity: 0.8, fontSize: "0.9375rem" }}>
              El Sistema de punto de venta en la nube diseñado para restaurantes que quieren operar
              más rápido y vender más.
            </p>
          </div>
          <div className="public-footer__col">
            <h4>Producto</h4>
            <Link href="/">Inicio</Link>
            <Link href="/servicios">Servicios</Link>
            <Link href="/nosotros">Sobre Nosotros</Link>
          </div>
          <div className="public-footer__col">
            <h4>Cuenta</h4>
            <Link href="/login">Iniciar sesión</Link>
            <Link href="/registro">Registrarse</Link>
          </div>
          <div className="public-footer__col">
            <h4>Soporte</h4>
            <a href="mailto:servi.tootal@gmail.com" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              servi.tootal@gmail.com
            </a>
            <Link href="/contacto">Contacto</Link>
            <Link href="/privacidad">Aviso de Privacidad</Link>

            {/* Redes Sociales */}
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.85rem", alignItems: "center" }}>
              <a
                href="https://www.facebook.com/profile.php?id=61592419372462"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                style={{ opacity: 0.8, transition: "opacity 0.2s" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/servi.tootal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                style={{ opacity: 0.8, transition: "opacity 0.2s" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="public-footer__bottom">
          © {new Date().getFullYear()} Servitotal. Creado por Zaira & Amauri. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PublicHeader />
      <main style={{ flex: 1, paddingTop: "80px" }}>{children}</main>
      <PublicFooter />
    </div>
  );
}