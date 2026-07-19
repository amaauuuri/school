"use client";

import { AdminShell } from "@/components/layout/AdminLayout";
import { MenuManagementView } from "@/components/admin/MenuManagementView";

export default function AdminMenuPage() {
  return (
    <AdminShell title="Gestión de Menú">
      <MenuManagementView />
    </AdminShell>
  );
}
