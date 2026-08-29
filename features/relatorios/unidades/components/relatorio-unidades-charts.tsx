"use client";

import { memo } from "react";
import { EChartsComposedChart, EChartsRadialChart, ReportChartCard, type ChartConfig } from "@/shared/ui";
import { cn } from "@/lib/cn";
import { percentual, textoCurto } from "@/features/relatorios/shared/relatorio-utils";
import type { RelatorioUnidadesResumo } from "../types";

const composedConfig = {
  unidades: { label: "Unidades", colors: { light: ["#2563eb"], dark: ["#60a5fa"] } },
  orgaos: { label: "Órgãos", colors: { light: ["#be123c"], dark: ["#fb7185"] } },
} satisfies ChartConfig;

const radialPalette = [
  { light: "#0d9488", dark: "#2dd4bf", swatch: "bg-[#0d9488] dark:bg-[#2dd4bf]" },
  { light: "#d97706", dark: "#fbbf24", swatch: "bg-[#d97706] dark:bg-[#fbbf24]" },
  { light: "#2563eb", dark: "#60a5fa", swatch: "bg-[#2563eb] dark:bg-[#60a5fa]" },
  { light: "#be123c", dark: "#fb7185", swatch: "bg-[#be123c] dark:bg-[#fb7185]" },
  { light: "#475569", dark: "#94a3b8", swatch: "bg-[#475569] dark:bg-[#94a3b8]" },
];

export const RelatorioUnidadesCharts = memo(function RelatorioUnidadesCharts({
  resumo,
  isLoading,
}: {
  resumo: RelatorioUnidadesResumo | undefined;
  isLoading: boolean;
}) {
  if (isLoading || !resumo) {
    return (
      <section className="grid gap-4 xl:grid-cols-2">
        <ReportChartCard title="Unidades por tipo">
          <div className="flex h-full items-center justify-center text-sm text-base-content/60">Carregando gráficos...</div>
        </ReportChartCard>
        <ReportChartCard title="Municípios atendidos">
          <div className="flex h-full items-center justify-center text-sm text-base-content/60">Carregando gráficos...</div>
        </ReportChartCard>
      </section>
    );
  }

  const composedData = resumo.porTipo.slice(0, 8).map((item) => ({
    tipo: item.label,
    unidades: item.total,
    orgaos: item.orgaos,
  }));
  const radialData = resumo.porMunicipio.slice(0, 5).map((item, index) => {
    const palette = radialPalette[index % radialPalette.length];
    return {
      name: item.id,
      label: item.label,
      value: percentual(item.total, resumo.kpis.totalUnidades),
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
      <ReportChartCard title="Unidades por tipo" description="Barras para volume de unidades e linha para órgãos envolvidos.">
        <EChartsComposedChart data={composedData} config={composedConfig} className="h-full w-full p-4" xDataKey="tipo">
          <EChartsComposedChart.Grid />
          <EChartsComposedChart.XAxis dataKey="tipo" tickFormatter={(value) => textoCurto(value, 10)} />
          <EChartsComposedChart.Legend isClickable />
          <EChartsComposedChart.Tooltip />
          <EChartsComposedChart.Bar dataKey="unidades" variant="hatched" isClickable />
          <EChartsComposedChart.Line dataKey="orgaos" isClickable />
        </EChartsComposedChart>
      </ReportChartCard>

      <ReportChartCard title="Municípios atendidos" description="Distribuição percentual das unidades por município.">
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
