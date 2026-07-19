"use client";

import { AdminShell } from "@/components/layout/AdminLayout";
import { RestaurantSettingsView } from "@/components/admin/RestaurantSettingsView";

export default function AdminConfigPage() {
  return (
    <AdminShell title="Configuración del Restaurante">
      <RestaurantSettingsView />
    </AdminShell>
  );
}
