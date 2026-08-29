"use client";

import { memo } from "react";
import { EChartsLineChart, EChartsRadarChart, ReportChartCard, type ChartConfig } from "@/shared/ui";
import type { RelatorioUsuariosKpis } from "../types";

const chartConfig = {
  usuarios: {
    label: "Usuários",
    colors: {
      light: ["#2563eb"],
      dark: ["#60a5fa"],
    },
  },
  media: {
    label: "Média por tipo",
    colors: {
      light: ["#059669"],
      dark: ["#34d399"],
    },
  },
} satisfies ChartConfig;

function textoCurto(valor: string) {
  return valor.length > 12 ? `${valor.slice(0, 12)}...` : valor;
}

function montarDadosGraficos(kpis: RelatorioUsuariosKpis) {
  const grupos = kpis.porTipo.length > 0 ? kpis.porTipo : [{ tipoId: 0, descricao: "Sem tipo", total: kpis.total }];
  const media = Math.round(kpis.total / Math.max(grupos.length, 1));

  return grupos.map((item) => ({
    tipo: item.descricao,
    usuarios: item.total,
    media,
  }));
}

export const RelatorioUsuariosCharts = memo(function RelatorioUsuariosCharts({
  kpis,
  isLoading,
}: {
  kpis: RelatorioUsuariosKpis | undefined;
  isLoading: boolean;
}) {
  if (isLoading || !kpis) {
    return (
      <section className="grid gap-4 xl:grid-cols-2">
        <ReportChartCard title="Comparativo por tipo">
          <div className="flex h-full items-center justify-center text-sm text-base-content/60">Carregando gráficos...</div>
        </ReportChartCard>
        <ReportChartCard title="Distribuição por tipo">
          <div className="flex h-full items-center justify-center text-sm text-base-content/60">Carregando gráficos...</div>
        </ReportChartCard>
      </section>
    );
  }

  const data = montarDadosGraficos(kpis);

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <ReportChartCard title="Comparativo por tipo" description="Quantidade de usuários frente à média geral por tipo.">
        <EChartsLineChart data={data} config={chartConfig} className="h-full w-full p-4" xDataKey="tipo">
          <EChartsLineChart.XAxis dataKey="tipo" tickFormatter={textoCurto} />
          <EChartsLineChart.Brush formatLabel={textoCurto} />
          <EChartsLineChart.Legend isClickable />
          <EChartsLineChart.Tooltip />
          <EChartsLineChart.Line dataKey="usuarios" strokeVariant="solid" isClickable>
            <EChartsLineChart.Dot variant="border" />
            <EChartsLineChart.ActiveDot variant="colored-border" />
          </EChartsLineChart.Line>
          <EChartsLineChart.Line dataKey="media" strokeVariant="dashed" isClickable>
            <EChartsLineChart.Dot variant="border" />
            <EChartsLineChart.ActiveDot variant="colored-border" />
          </EChartsLineChart.Line>
        </EChartsLineChart>
      </ReportChartCard>

      <ReportChartCard title="Distribuição por tipo" description="Leitura radial dos mesmos KPIs do relatório.">
        <EChartsRadarChart data={data} config={chartConfig} className="h-full w-full p-4">
          <EChartsRadarChart.PolarGrid />
          <EChartsRadarChart.PolarAngleAxis dataKey="tipo" />
          <EChartsRadarChart.Legend isClickable />
          <EChartsRadarChart.Tooltip />
          <EChartsRadarChart.Radar dataKey="usuarios" variant="filled" isClickable>
            <EChartsRadarChart.Dot variant="colored-border" />
            <EChartsRadarChart.ActiveDot variant="default" />
          </EChartsRadarChart.Radar>
          <EChartsRadarChart.Radar dataKey="media" variant="filled" isClickable>
            <EChartsRadarChart.Dot variant="colored-border" />
            <EChartsRadarChart.ActiveDot variant="default" />
          </EChartsRadarChart.Radar>
        </EChartsRadarChart>
      </ReportChartCard>
    </section>
  );
});
