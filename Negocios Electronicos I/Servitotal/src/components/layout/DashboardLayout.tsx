"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useServitotalStore } from "@/lib/store";
import { useAuth } from "@/lib/AuthContext";
import { AuthGuard } from "./AuthGuard";

const NAV_ITEMS = [
  { href: "/dashboard/mesas", label: "Mesas", icon: "🪑" },
  { href: "/dashboard/ordenes", label: "Órdenes", icon: "📋" },
  { href: "/dashboard/caja", label: "Caja", icon: "💳" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { config } = useServitotalStore();
  const { logout, profile } = useAuth();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    router.push("/");
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar__header">
        <Link href="/dashboard/mesas" className="public-header__logo">
          <span className="public-header__logo-icon">S</span>
          Servitotal
        </Link>
        <div className="dashboard-sidebar__restaurant">{config.name}</div>
      </div>

      <nav className="dashboard-sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`dashboard-sidebar__link ${
              pathname.startsWith(item.href)
                ? "dashboard-sidebar__link--active"
                : ""
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
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}

export function DashboardShell({ children, title, actions }: DashboardLayoutProps) {
  return (
    <AuthGuard requireAdmin={false}>
      <div className="dashboard-layout">
        <DashboardSidebar />
        <div className="dashboard-main">
          <header className="dashboard-topbar">
            <h1 className="dashboard-topbar__title">{title}</h1>
            {actions && (
              <div className="dashboard-topbar__meta">{actions}</div>
            )}
          </header>
          <div className="dashboard-content">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
