"use client";

import { AdminShell } from "@/components/layout/AdminLayout";
import { ReportsView } from "@/components/admin/ReportsView";

export default function AdminReportesPage() {
  return (
    <AdminShell title="Reportes y Analíticas">
      <ReportsView />
    </AdminShell>
  );
}
