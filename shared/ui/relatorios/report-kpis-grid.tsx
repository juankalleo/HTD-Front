"use client";

import { KpiCounter } from "./kpi-counter";

export type ReportKpi = {
  label: string;
  value: number | string;
  tone?: "neutro" | "success" | "danger";
};

export function ReportKpisGrid({
  items,
  isLoading,
}: {
  items: ReportKpi[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <p className="text-sm text-base-content/60">Carregando indicadores...</p>;
  }

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.slice(0, 4).map((item) => (
        <KpiCounter key={item.label} label={item.label} value={item.value} tone={item.tone} />
      ))}
    </section>
  );
}
