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
            aria-label="Abrir menú"
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.75rem",
              color: "var(--color-secondary)",
              cursor: "pointer",
              marginLeft: "0.5rem"
            }}
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
              El POS en la nube diseñado para restaurantes que quieren operar
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
            <a href="mailto:servi.tootal@gmail.com">servi.tootal@gmail.com</a>
            <Link href="/contacto">Contacto</Link>
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
