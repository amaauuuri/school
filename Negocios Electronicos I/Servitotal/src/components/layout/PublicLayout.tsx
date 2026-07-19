"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/precios", label: "Precios" },
];

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="public-header">
      <div className="container public-header__inner">
        <Link href="/" className="public-header__logo">
          <span className="public-header__logo-icon">S</span>
          Servitotal
        </Link>

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

        <div className="public-header__actions">
          <Link href="/login">
            <Button variant="ghost">Iniciar sesión</Button>
          </Link>
          <Link href="/registro">
            <Button variant="primary">Registrarse</Button>
          </Link>
        </div>
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
            <Link href="/precios">Precios</Link>
            <Link href="/dashboard/mesas">Demo operativa</Link>
          </div>
          <div className="public-footer__col">
            <h4>Cuenta</h4>
            <Link href="/login">Iniciar sesión</Link>
            <Link href="/registro">Registrarse</Link>
          </div>
          <div className="public-footer__col">
            <h4>Soporte</h4>
            <a href="mailto:soporte@servitotal.mx">soporte@servitotal.mx</a>
            <a href="#">Centro de ayuda</a>
          </div>
        </div>
        <div className="public-footer__bottom">
          © {new Date().getFullYear()} Servitotal. Todos los derechos reservados.
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
