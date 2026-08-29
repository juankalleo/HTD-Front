"use client";

import { memo } from "react";
import { EChartsBarChart, EChartsRadialChart, ReportChartCard, type ChartConfig } from "@/shared/ui";
import { cn } from "@/lib/cn";
import { percentual, textoCurto } from "@/features/relatorios/shared/relatorio-utils";
import type { RelatorioOrgaosResumo } from "../types";

const barConfig = {
  orgaos: { label: "Órgãos", colors: { light: ["#2563eb"], dark: ["#60a5fa"] } },
  unidades: { label: "Unidades", colors: { light: ["#059669"], dark: ["#34d399"] } },
} satisfies ChartConfig;

const radialPalette = [
  { light: "#2563eb", dark: "#60a5fa", swatch: "bg-[#2563eb] dark:bg-[#60a5fa]" },
  { light: "#059669", dark: "#34d399", swatch: "bg-[#059669] dark:bg-[#34d399]" },
  { light: "#be123c", dark: "#fb7185", swatch: "bg-[#be123c] dark:bg-[#fb7185]" },
  { light: "#7c3aed", dark: "#a78bfa", swatch: "bg-[#7c3aed] dark:bg-[#a78bfa]" },
  { light: "#d97706", dark: "#fbbf24", swatch: "bg-[#d97706] dark:bg-[#fbbf24]" },
];

export const RelatorioOrgaosCharts = memo(function RelatorioOrgaosCharts({
  resumo,
  isLoading,
}: {
  resumo: RelatorioOrgaosResumo | undefined;
  isLoading: boolean;
}) {
  if (isLoading || !resumo) {
    return (
      <section className="grid gap-4 xl:grid-cols-2">
        <ReportChartCard title="Órgãos por tenant">
          <div className="flex h-full items-center justify-center text-sm text-base-content/60">Carregando gráficos...</div>
        </ReportChartCard>
        <ReportChartCard title="Participação dos tenants">
          <div className="flex h-full items-center justify-center text-sm text-base-content/60">Carregando gráficos...</div>
        </ReportChartCard>
      </section>
    );
  }

  const barData = resumo.porTenant.slice(0, 8).map((item) => ({
    tenant: item.label,
    orgaos: item.total,
    unidades: item.unidades,
  }));
  const radialData = resumo.porTenant.slice(0, 5).map((item, index) => {
    const palette = radialPalette[index % radialPalette.length];
    return {
      name: item.id,
      label: item.label,
      value: percentual(item.total, resumo.kpis.totalOrgaos),
      amount: item.total,
      swatch: palette.swatch,
    };
  });
  const radialConfig = Object.fromEntries(
    radialData.map((item, index) => {
      const palette = radialPalette[index % radialPalette.length];
      return [item.name, { label: item.label, colors: { light: [palette.light], dark: [palette.dark] } }];
    }),
  ) satisfies ChartConfig;

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <ReportChartCard title="Órgãos por tenant" description="Compara órgãos cadastrados e unidades vinculadas por tenant.">
        <EChartsBarChart data={barData} config={barConfig} className="h-full w-full p-4" xDataKey="tenant">
          <EChartsBarChart.Grid />
          <EChartsBarChart.YAxis />
          <EChartsBarChart.XAxis dataKey="tenant" tickFormatter={(value) => textoCurto(value, 10)} />
          <EChartsBarChart.Brush formatLabel={(value) => textoCurto(String(value), 10)} />
          <EChartsBarChart.Legend isClickable />
          <EChartsBarChart.Tooltip />
          <EChartsBarChart.Bar dataKey="orgaos" variant="default" isClickable />
          <EChartsBarChart.Bar dataKey="unidades" variant="hatched" isClickable />
        </EChartsBarChart>
      </ReportChartCard>

      <ReportChartCard title="Participação dos tenants" description="Percentual de órgãos concentrados nos principais tenants.">
        <div className="flex h-full w-full flex-col gap-5 p-4">
          <div className="grid shrink-0 grid-cols-5 gap-2">
            {radialData.map((row) => (
              <div key={row.name} className="flex flex-col items-center gap-1">
                <div className="aspect-square w-full max-w-14">
                  <EChartsRadialChart
                    data={[row]}
                    config={radialConfig}
                    nameKey="name"
                    max={100}
                    innerRadius="66%"
                    outerRadius="100%"
                    className="h-full w-full"
                  >
                    <EChartsRadialChart.RadialBar dataKey="value" barSize={8} cornerRadius={6} />
                  </EChartsRadialChart>
                </div>
                <span className="w-full truncate text-center text-[10px] text-base-content/60 sm:text-[11px]">{row.label}</span>
              </div>
            ))}
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            {radialData.map(({ name, label, value, amount, swatch }) => (
              <div key={name} className="flex flex-1 items-center gap-2 rounded-md px-3 odd:bg-base-200/40">
                <span className={cn("size-2.5 shrink-0 rounded-[3px]", swatch)} />
                <span className="text-xs font-medium tabular-nums text-base-content">{value}%</span>
                <span className="truncate text-xs text-base-content/60">{label}</span>
                <span className="ml-auto text-xs font-medium text-base-content">{amount}</span>
              </div>
            ))}
          </div>
        </div>
      </ReportChartCard>
    </section>
  );
});
