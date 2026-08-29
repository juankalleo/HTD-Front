"use client";

import { useMemo, type ReactNode } from "react";
import type { EChartsOption } from "echarts";
import {
  createChartPart,
  EChartsRenderer,
  firstPartProps,
  getPartProps,
  seriesColor,
  seriesLabel,
  stableChartKey,
  toNumber,
  toText,
  useChartThemeMode,
  type ChartConfig,
  type ChartDatum,
} from "../chart-utils";

export type { ChartConfig } from "../chart-utils";

type RadarChartProps = {
  data: ChartDatum[];
  config: ChartConfig;
  className?: string;
  children?: ReactNode;
};

type PolarGridProps = Record<string, never>;

type PolarAngleAxisProps = {
  dataKey: string;
};

type LegendProps = {
  isClickable?: boolean;
};

type TooltipProps = Record<string, never>;

type RadarProps = {
  dataKey: string;
  variant?: "default" | "filled";
  isClickable?: boolean;
  children?: ReactNode;
};

type DotProps = {
  variant?: "default" | "border" | "colored-border";
};

const PARTS = {
  grid: "radar-grid",
  angleAxis: "radar-angle-axis",
  legend: "radar-legend",
  tooltip: "radar-tooltip",
  radar: "radar-series",
  dot: "radar-dot",
  activeDot: "radar-active-dot",
};

function buildRadarOption({
  data,
  config,
  mode,
  angleAxis,
  grid,
  legend,
  tooltip,
  radars,
}: {
  data: ChartDatum[];
  config: ChartConfig;
  mode: "light" | "dark";
  angleAxis: PolarAngleAxisProps;
  grid?: PolarGridProps;
  legend?: LegendProps;
  tooltip?: TooltipProps;
  radars: RadarProps[];
}): EChartsOption {
  const colors = radars.map((radar, index) => seriesColor(config, radar.dataKey, mode, index));
  const labelColor = mode === "dark" ? "#cbd5e1" : "#475569";
  const mutedColor = mode === "dark" ? "rgba(148, 163, 184, 0.28)" : "rgba(100, 116, 139, 0.24)";

  const maxima = data.map((item) => {
    const maxValue = Math.max(...radars.map((radar) => toNumber(item[radar.dataKey])), 0);
    return Math.max(1, Math.ceil(maxValue * 1.2));
  });

  return {
    animationDuration: 600,
    color: colors,
    legend: legend
      ? {
          top: 0,
          icon: "circle",
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: labelColor, fontSize: 12 },
          selectedMode: legend.isClickable ?? true,
        }
      : undefined,
    tooltip: tooltip ? { trigger: "item", confine: true } : undefined,
    radar: {
      center: ["50%", legend ? "56%" : "52%"],
      radius: "70%",
      indicator: data.map((item, index) => ({ name: toText(item[angleAxis.dataKey]), max: maxima[index] })),
      axisName: { color: labelColor },
      axisLine: { lineStyle: { color: mutedColor } },
      splitLine: { show: Boolean(grid), lineStyle: { color: mutedColor } },
      splitArea: {
        show: Boolean(grid),
        areaStyle: {
          color: mode === "dark" ? ["rgba(15, 23, 42, 0.28)", "rgba(15, 23, 42, 0.08)"] : ["rgba(248, 250, 252, 0.9)", "rgba(241, 245, 249, 0.65)"],
        },
      },
    },
    series: [
      {
        type: "radar",
        data: radars.map((radar, index) => {
          const dot = firstPartProps<DotProps>(radar.children, PARTS.dot);
          const activeDot = firstPartProps<DotProps>(radar.children, PARTS.activeDot);
          const color = colors[index];

          return {
            name: seriesLabel(config, radar.dataKey),
            value: data.map((item) => toNumber(item[radar.dataKey])),
            symbol: dot ? "circle" : "none",
            symbolSize: dot ? 6 : 0,
            lineStyle: { width: 2.5, color },
            areaStyle: radar.variant === "filled" ? { opacity: 0.18, color } : undefined,
            itemStyle: {
              color: dot?.variant === "border" || dot?.variant === "colored-border" ? mode === "dark" ? "#111827" : "#ffffff" : color,
              borderColor: color,
              borderWidth: dot?.variant === "border" || dot?.variant === "colored-border" ? 2 : 0,
            },
            emphasis: {
              focus: radar.isClickable ? ("series" as const) : undefined,
              scale: Boolean(activeDot),
              itemStyle: {
                color,
                borderColor: mode === "dark" ? "#020617" : "#ffffff",
                borderWidth: activeDot?.variant === "colored-border" ? 3 : 2,
              },
            },
          };
        }),
      },
    ],
  };
}

function EChartsRadarChartRoot({ data, config, className, children }: RadarChartProps) {
  const mode = useChartThemeMode();
  const parts = useMemo(() => {
    const parsedRadars = getPartProps<RadarProps>(children, PARTS.radar);

    return {
      angleAxis: firstPartProps<PolarAngleAxisProps>(children, PARTS.angleAxis) ?? { dataKey: "name" },
      grid: firstPartProps<PolarGridProps>(children, PARTS.grid),
      legend: firstPartProps<LegendProps>(children, PARTS.legend),
      tooltip: firstPartProps<TooltipProps>(children, PARTS.tooltip),
      visibleRadars: parsedRadars.length > 0 ? parsedRadars : Object.keys(config).map((dataKey) => ({ dataKey })),
    };
  }, [children, config]);
  const optionKey = stableChartKey({
    data,
    config,
    mode,
    angleAxisKey: parts.angleAxis.dataKey,
    radars: parts.visibleRadars.map((radar) => radar.dataKey),
    grid: Boolean(parts.grid),
    legend: parts.legend,
    tooltip: Boolean(parts.tooltip),
  });
  const option = useMemo(
    () =>
      buildRadarOption({
        data,
        config,
        mode,
        angleAxis: parts.angleAxis,
        grid: parts.grid,
        legend: parts.legend,
        tooltip: parts.tooltip,
        radars: parts.visibleRadars,
      }),
    [config, data, mode, parts],
  );

  return <EChartsRenderer key={optionKey} option={option} className={className} />;
}

export const EChartsRadarChart = Object.assign(EChartsRadarChartRoot, {
  PolarGrid: createChartPart<PolarGridProps>(PARTS.grid),
  PolarAngleAxis: createChartPart<PolarAngleAxisProps>(PARTS.angleAxis),
  Legend: createChartPart<LegendProps>(PARTS.legend),
  Tooltip: createChartPart<TooltipProps>(PARTS.tooltip),
  Radar: createChartPart<RadarProps>(PARTS.radar),
  Dot: createChartPart<DotProps>(PARTS.dot),
  ActiveDot: createChartPart<DotProps>(PARTS.activeDot),
});
