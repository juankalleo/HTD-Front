"use client";

import { cn } from "@/lib/cn";

const TOM_CLASSE: Record<string, string> = {
  neutro: "text-base-content",
  success: "text-success",
  danger: "text-error",
};

/** Contador de KPI padrão dos relatórios — `stat` do DaisyUI, só para número resumido. */
export function KpiCounter({
  label,
  value,
  tone = "neutro",
}: {
  label: string;
  value: number | string;
  tone?: "neutro" | "success" | "danger";
}) {
  return (
    <div className="stat rounded-lg border border-base-300 p-4">
      <div className="stat-title text-xs">{label}</div>
      <div className={cn("stat-value text-2xl", TOM_CLASSE[tone])}>{value}</div>
    </div>
  );
}
