"use client";

import { ReportKpisGrid, type ReportKpi } from "@/shared/ui";
import type { RelatorioUsuariosKpis } from "../types";

export function RelatorioUsuariosKpisSection({ kpis, isLoading }: { kpis: RelatorioUsuariosKpis | undefined; isLoading: boolean }) {
  if (!kpis) return <ReportKpisGrid items={[]} isLoading={isLoading} />;

  const principaisTipos = [...kpis.porTipo].sort((left, right) => right.total - left.total).slice(0, 3);
  const items: ReportKpi[] = [
    { label: "Total de usuários", value: kpis.total },
    ...principaisTipos.map((item) => ({ label: item.descricao, value: item.total })),
  ];

  return <ReportKpisGrid items={items} />;
}
