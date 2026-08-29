"use client";

import { Children, isValidElement, useCallback, useSyncExternalStore, type ComponentType, type PropsWithChildren, type ReactNode } from "react";
import type { EChartsOption, EChartsType } from "echarts";
import { cn } from "@/lib/cn";

export type ChartDatum = Record<string, string | number | null | undefined>;

export type ChartConfig = Record<
  string,
  {
    label: string;
    colors: {
      light: string[];
      dark: string[];
    };
  }
>;

export type ChartThemeMode = "light" | "dark";

type ChartPartComponent<Props extends object> = ComponentType<PropsWithChildren<Props>> & {
  chartPart: string;
};

const FALLBACK_COLORS: Record<ChartThemeMode, string[]> = {
  light: ["#2563eb", "#059669", "#be123c", "#7c3aed", "#d97706"],
  dark: ["#60a5fa", "#34d399", "#fb7185", "#a78bfa", "#fbbf24"],
};

function getThemeModeSnapshot(): ChartThemeMode {
  if (typeof document === "undefined") return "light";

  const theme = document.documentElement.dataset.theme ?? document.body?.dataset.theme ?? "";
  if (theme === "dark" || theme === "business") return "dark";
  if (theme === "light" || theme === "corporate") return "light";
  if (document.documentElement.classList.contains("dark")) return "dark";

  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

function subscribeThemeMode(onStoreChange: () => void) {
  if (typeof window === "undefined" || typeof document === "undefined") return () => undefined;

  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
  if (document.body) {
    observer.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onStoreChange);

  return () => {
    observer.disconnect();
    media.removeEventListener("change", onStoreChange);
  };
}

export function useChartThemeMode(): ChartThemeMode {
  return useSyncExternalStore(subscribeThemeMode, getThemeModeSnapshot, () => "light");
}

export function createChartPart<Props extends object>(chartPart: string) {
  const Part = function ChartPart() {
    return null;
  };

  Part.chartPart = chartPart;
  return Part as ChartPartComponent<Props>;
}

export function getPartProps<Props extends object>(children: ReactNode, chartPart: string): Props[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];

    const type = child.type as { chartPart?: string };
    if (type.chartPart !== chartPart) return [];

    return [child.props as Props];
  });
}

export function firstPartProps<Props extends object>(children: ReactNode, chartPart: string): Props | undefined {
  return getPartProps<Props>(children, chartPart)[0];
}

export function seriesColor(config: ChartConfig, dataKey: string, mode: ChartThemeMode, index: number) {
  return config[dataKey]?.colors[mode]?.[0] ?? FALLBACK_COLORS[mode][index % FALLBACK_COLORS[mode].length];
}

export function seriesLabel(config: ChartConfig, dataKey: string) {
  return config[dataKey]?.label ?? dataKey;
}

export function toNumber(value: ChartDatum[string]) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function toText(value: ChartDatum[string]) {
  return value === null || value === undefined ? "" : String(value);
}

export function stableChartKey(value: unknown) {
  return JSON.stringify(value);
}

export function EChartsRenderer({
  option,
  className,
}: {
  option: EChartsOption;
  className?: string;
}) {
  const mountChart = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return undefined;

      let chart: EChartsType | undefined;
      let resizeObserver: ResizeObserver | undefined;
      let frame = 0;
      let mounted = true;

      void import("echarts").then((echarts) => {
        if (!mounted) return;

        chart = echarts.init(node, undefined, { renderer: "canvas" });
        chart.setOption(option, true);

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => chart?.resize());
          resizeObserver.observe(node);
        }

        frame = window.requestAnimationFrame(() => chart?.resize());
      });

      return () => {
        mounted = false;
        if (frame) window.cancelAnimationFrame(frame);
        resizeObserver?.disconnect();
        chart?.dispose();
      };
    },
    [option],
  );

  return <div ref={mountChart} className={cn("min-h-72 w-full", className)} />;
}
