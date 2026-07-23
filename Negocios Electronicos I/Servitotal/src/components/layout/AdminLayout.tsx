"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useFirestore } from "@/lib/FirestoreContext";
import { AuthGuard } from "./AuthGuard";

const NAV_ITEMS = [
  { href: "/admin/menu", label: "Menú", icon: "🍽️" },
  { href: "/admin/reportes", label: "Reportes", icon: "📊" },
  { href: "/admin/configuracion", label: "Configuración", icon: "🏪" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, profile } = useAuth();
  const { restaurantConfig } = useFirestore();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    router.push("/");
  };

  const restaurantName = restaurantConfig?.name || profile?.restaurantName || "Servitotal Admin";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__header">
          <Link href="/admin/menu" className="public-header__logo">
            <span className="public-header__logo-icon">S</span>
            <span className="dashboard-sidebar__logo-text">Servitotal</span>
          </Link>
          <div className="dashboard-sidebar__restaurant">
            Panel Admin · {restaurantName}
          </div>
        </div>

        <nav className="dashboard-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`dashboard-sidebar__link ${
                pathname.startsWith(item.href) ? "dashboard-sidebar__link--active" : ""
              }`}
            >
              <span className="dashboard-sidebar__link-icon">{item.icon}</span>
              <span className="dashboard-sidebar__link-text">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="dashboard-sidebar__footer">
          <Link href="/dashboard/mesas" className="dashboard-sidebar__link">
            <span className="dashboard-sidebar__link-icon">🪑</span>
            <span className="dashboard-sidebar__link-text">Vista Operativa</span>
          </Link>
          <a href="#" onClick={handleLogout} className="dashboard-sidebar__link">
            <span className="dashboard-sidebar__link-icon">↩</span>
            <span className="dashboard-sidebar__link-text">Salir</span>
          </a>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${
              pathname.startsWith(item.href) ? "mobile-nav-item--active" : ""
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <Link href="/dashboard/mesas" className="mobile-nav-item">
          <span>🪑</span>
          Operativa
        </Link>
      </nav>
    </>
  );
}

interface AdminShellProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}

export function AdminShell({ children, title, actions }: AdminShellProps) {
  const { restaurantConfig } = useFirestore();
  const { profile } = useAuth();
  const restaurantName = restaurantConfig?.name || profile?.restaurantName || "Servitotal";

  return (
    <AuthGuard requireAdmin={true}>
      <div className="dashboard-layout">
        <AdminSidebar />
        <div className="dashboard-main">
          <header className="dashboard-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h1 className="dashboard-topbar__title">{title}</h1>
              <span className="badge badge--neutral" style={{ fontSize: "0.75rem" }}>
                {restaurantName}
              </span>
            </div>
            {actions && <div className="dashboard-topbar__meta">{actions}</div>}
          </header>
          <div className="dashboard-content">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
