"use client";

import { DashboardShell } from "@/components/layout/DashboardLayout";
import { CashRegisterView } from "@/components/caja/CashRegisterView";

export default function CajaPage() {
  return (
    <DashboardShell title="Caja">
      <CashRegisterView />
    </DashboardShell>
  );
}
