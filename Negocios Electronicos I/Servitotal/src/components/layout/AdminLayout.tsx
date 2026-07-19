"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useServitotalStore } from "@/lib/store";
import { useAuth } from "@/lib/AuthContext";
import { AuthGuard } from "./AuthGuard";

const NAV_ITEMS = [
  { href: "/admin/menu", label: "Menú", icon: "🍽️" },
  { href: "/admin/reportes", label: "Reportes", icon: "📊" },
  { href: "/admin/configuracion", label: "Configuración", icon: "🏪" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { config } = useServitotalStore();
  const { logout } = useAuth();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    router.push("/");
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar__header">
        <Link href="/admin/menu" className="public-header__logo">
          <span className="public-header__logo-icon">S</span>
          Servitotal
        </Link>
        <div className="dashboard-sidebar__restaurant">
          Admin · {config.name}
        </div>
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
        <Link href="/dashboard/mesas" className="dashboard-sidebar__link">
          <span className="dashboard-sidebar__link-icon">🪑</span>
          Vista Operativa
        </Link>
        <a href="#" onClick={handleLogout} className="dashboard-sidebar__link">
          <span className="dashboard-sidebar__link-icon">↩</span>
          Salir
        </a>
      </div>
    </aside>
  );
}

interface AdminShellProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}

export function AdminShell({ children, title, actions }: AdminShellProps) {
  return (
    <AuthGuard requireAdmin={true}>
      <div className="dashboard-layout">
        <AdminSidebar />
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
