"use client";

import { DashboardShell } from "@/components/layout/DashboardLayout";
import { TableGrid } from "@/components/mesas/TableGrid";
import { Badge } from "@/components/ui/Badge";
import { useServitotalStore } from "@/lib/store";

export default function MesasPage() {
  const { tables } = useServitotalStore();
  const occupied = tables.filter((t) => t.status !== "disponible").length;

  return (
    <DashboardShell
      title="Mapa de Mesas"
      actions={
        <Badge variant="neutral">
          {occupied} / {tables.length} activas
        </Badge>
      }
    >
      <TableGrid />
    </DashboardShell>
  );
}
