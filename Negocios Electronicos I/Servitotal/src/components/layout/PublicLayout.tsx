"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/precios", label: "Precios y Servicios" },
  { href: "/contacto", label: "Nosotros y Contacto" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <Link href="/login" className="hide-mobile">
            <Button variant="ghost">Iniciar sesión</Button>
          </Link>
          <Link href="/registro">
            <Button variant="primary">Registrarse</Button>
          </Link>
          
          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="mobile-burger-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menú"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="public-mobile-drawer">
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
            <hr style={{ borderColor: "var(--color-border)", margin: "0.5rem 0" }} />
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" block>Iniciar sesión</Button>
            </Link>
          </nav>
        </div>
      )}
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
              <span className="public-header__logo-icon">S</span>
              Servitotal
            </div>
            <p>
              El POS en la nube diseñado para restaurantes que quieren operar
              más rápido y vender más.
            </p>
          </div>
          <div className="public-footer__col">
            <h4>Producto</h4>
            <Link href="/">Funcionalidades</Link>
            <Link href="/precios">Precios y Servicios</Link>
            <Link href="/contacto">Nosotros</Link>
          </div>
          <div className="public-footer__col">
            <h4>Cuenta</h4>
            <Link href="/login">Iniciar sesión</Link>
            <Link href="/registro">Registrarse</Link>
          </div>
          <div className="public-footer__col">
            <h4>Soporte</h4>
            <a href="mailto:servi.tootal@gmail.com">servi.tootal@gmail.com</a>
            <Link href="/contacto">Centro de contacto</Link>
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
      <main style={{ flex: 1 }}>{children}</main>
      <PublicFooter />
    </div>
  );
}
