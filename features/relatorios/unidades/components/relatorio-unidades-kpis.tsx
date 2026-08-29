"use client";

import { ReportKpisGrid, type ReportKpi } from "@/shared/ui";
import type { RelatorioUnidadesResumo } from "../types";

export function RelatorioUnidadesKpisSection({
  resumo,
  isLoading,
}: {
  resumo: RelatorioUnidadesResumo | undefined;
  isLoading: boolean;
}) {
  if (!resumo) return <ReportKpisGrid items={[]} isLoading={isLoading} />;

  const items: ReportKpi[] = [
    { label: "Total de unidades", value: resumo.kpis.totalUnidades },
    { label: "Órgãos com unidade", value: resumo.kpis.orgaosComUnidade },
    { label: "Tipos usados", value: resumo.kpis.tiposUsados },
    { label: "Municípios atendidos", value: resumo.kpis.municipiosAtendidos },
  ];

  return <ReportKpisGrid items={items} />;
}
