"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useFirestore } from "@/lib/FirestoreContext";
import { AuthGuard } from "./AuthGuard";

const NAV_ITEMS = [
  { href: "/dashboard/mesas", label: "Mesas", icon: "🪑" },
  { href: "/dashboard/ordenes", label: "Órdenes", icon: "📋" },
  { href: "/dashboard/caja", label: "Caja", icon: "💳" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, profile } = useAuth();
  const { restaurantConfig } = useFirestore();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    router.push("/");
  };

  const restaurantName = restaurantConfig?.name || profile?.restaurantName || "Servitotal POS";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__header">
          <Link href="/dashboard/mesas" className="public-header__logo">
            <span className="public-header__logo-icon">S</span>
            Servitotal
          </Link>
          <div className="dashboard-sidebar__restaurant">{restaurantName}</div>
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
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="dashboard-sidebar__footer">
          {profile?.role === "ADMIN" && (
            <Link href="/admin/menu" className="dashboard-sidebar__link">
              <span className="dashboard-sidebar__link-icon">⚙️</span>
              Panel Admin
            </Link>
          )}
          <a href="#" onClick={handleLogout} className="dashboard-sidebar__link">
            <span className="dashboard-sidebar__link-icon">↩</span>
            Salir
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
        {profile?.role === "ADMIN" && (
          <Link
            href="/admin/menu"
            className={`mobile-nav-item ${
              pathname.startsWith("/admin") ? "mobile-nav-item--active" : ""
            }`}
          >
            <span>⚙️</span>
            Admin
          </Link>
        )}
      </nav>
    </>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}

export function DashboardShell({ children, title, actions }: DashboardLayoutProps) {
  const { restaurantConfig } = useFirestore();
  const { profile } = useAuth();
  const restaurantName = restaurantConfig?.name || profile?.restaurantName || "Servitotal";

  return (
    <AuthGuard requireAdmin={false}>
      <div className="dashboard-layout">
        <DashboardSidebar />
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
