"use client";

import { DashboardShell } from "@/components/layout/DashboardLayout";
import { OrderTakingView } from "@/components/ordenes/OrderTakingView";

export default function OrdenesPage() {
  return (
    <DashboardShell title="Toma de Órdenes">
      <OrderTakingView />
    </DashboardShell>
  );
}
