"use client";

import { DashboardShell } from "@/components/layout/DashboardLayout";
import { TableGrid } from "@/components/mesas/TableGrid";
import { Badge } from "@/components/ui/Badge";
import { useFirestore } from "@/lib/FirestoreContext";

export default function MesasPage() {
  const { activeOrders, restaurantConfig } = useFirestore();
  const tableCount = restaurantConfig?.tableCount ?? 0;
  // A table is "occupied" if it has any non-paid active order
  const occupied = new Set(activeOrders.map((o) => o.mesaNumero)).size;

  return (
    <DashboardShell
      title="Mapa de Mesas"
      actions={
        <Badge variant="neutral">
          {occupied} / {tableCount} activas
        </Badge>
      }
    >
      <TableGrid />
    </DashboardShell>
  );
}
