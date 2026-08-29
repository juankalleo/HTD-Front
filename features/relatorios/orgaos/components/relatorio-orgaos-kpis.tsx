"use client";

import { ReportKpisGrid, type ReportKpi } from "@/shared/ui";
import type { RelatorioOrgaosResumo } from "../types";

export function RelatorioOrgaosKpisSection({
  resumo,
  isLoading,
}: {
  resumo: RelatorioOrgaosResumo | undefined;
  isLoading: boolean;
}) {
  if (!resumo) return <ReportKpisGrid items={[]} isLoading={isLoading} />;

  const items: ReportKpi[] = [
    { label: "Total de órgãos", value: resumo.kpis.totalOrgaos },
    { label: "Tenants", value: resumo.kpis.totalTenants },
    { label: "Órgãos por tenant", value: resumo.kpis.mediaPorTenant },
    { label: "Unidades vinculadas", value: resumo.kpis.totalUnidades },
  ];

  return <ReportKpisGrid items={items} />;
}
