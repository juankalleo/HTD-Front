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

type BarChartProps = {
  data: ChartDatum[];
  config: ChartConfig;
  className?: string;
  xDataKey: string;
  children?: ReactNode;
};

type GridProps = Record<string, never>;

type XAxisProps = {
  dataKey: string;
  tickFormatter?: (value: string) => string;
};

type YAxisProps = {
  tickFormatter?: (value: number) => string;
};

type BrushProps = {
  formatLabel?: (value: string) => string;
};

type LegendProps = {
  isClickable?: boolean;
};

type TooltipProps = Record<string, never>;

type BarProps = {
  dataKey: string;
  variant?: "default" | "hatched";
  barSize?: number;
  isClickable?: boolean;
};

const PARTS = {
  grid: "bar-grid",
  xAxis: "bar-x-axis",
  yAxis: "bar-y-axis",
  brush: "bar-brush",
  legend: "bar-legend",
  tooltip: "bar-tooltip",
  bar: "bar-series",
};

function buildBarOption({
  data,
  config,
  mode,
  grid,
  xAxis,
  yAxis,
  brush,
  legend,
  tooltip,
  bars,
}: {
  data: ChartDatum[];
  config: ChartConfig;
  mode: "light" | "dark";
  grid?: GridProps;
  xAxis: XAxisProps;
  yAxis?: YAxisProps;
  brush?: BrushProps;
  legend?: LegendProps;
  tooltip?: TooltipProps;
  bars: BarProps[];
}): EChartsOption {
  const colors = bars.map((bar, index) => seriesColor(config, bar.dataKey, mode, index));
  const labelColor = mode === "dark" ? "#cbd5e1" : "#475569";
  const mutedColor = mode === "dark" ? "rgba(148, 163, 184, 0.24)" : "rgba(100, 116, 139, 0.22)";

  return {
    animationDuration: 600,
    color: colors,
    grid: { left: 42, right: 18, top: legend ? 44 : 18, bottom: brush ? 58 : 34 },
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
    tooltip: tooltip ? { trigger: "axis", axisPointer: { type: "shadow" }, confine: true } : undefined,
    xAxis: {
      type: "category",
      data: data.map((item) => toText(item[xAxis.dataKey])),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: mutedColor } },
      axisLabel: {
        color: labelColor,
        formatter: (value: string) => xAxis.tickFormatter?.(value) ?? value,
      },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      axisLabel: {
        color: labelColor,
        formatter: (value: number) => yAxis?.tickFormatter?.(value) ?? String(value),
      },
      splitLine: { show: Boolean(grid), lineStyle: { color: mutedColor } },
    },
    dataZoom: brush
      ? [
          {
            type: "slider",
            height: 22,
            bottom: 8,
            brushSelect: false,
            borderColor: mutedColor,
            fillerColor: mode === "dark" ? "rgba(96, 165, 250, 0.22)" : "rgba(37, 99, 235, 0.14)",
            handleStyle: { color: mode === "dark" ? "#94a3b8" : "#64748b" },
            textStyle: { color: labelColor },
            labelFormatter: (_value: number, valueText: string) => brush.formatLabel?.(valueText) ?? valueText,
          },
        ]
      : undefined,
    series: bars.map((bar, index) => {
      const color = colors[index];

      return {
        type: "bar" as const,
        name: seriesLabel(config, bar.dataKey),
        data: data.map((item) => toNumber(item[bar.dataKey])),
        barMaxWidth: bar.barSize ?? 34,
        itemStyle: {
          color,
          borderRadius: [5, 5, 0, 0],
          decal: bar.variant === "hatched" ? { symbol: "rect", dashArrayX: [2, 0], dashArrayY: [4, 4], color: mode === "dark" ? "rgba(2, 6, 23, 0.35)" : "rgba(255, 255, 255, 0.55)" } : undefined,
        },
        emphasis: { focus: bar.isClickable ? ("series" as const) : undefined },
      };
    }),
  };
}

function EChartsBarChartRoot({ data, config, className, xDataKey, children }: BarChartProps) {
  const mode = useChartThemeMode();
  const parts = useMemo(() => {
    const parsedBars = getPartProps<BarProps>(children, PARTS.bar);

    return {
      grid: firstPartProps<GridProps>(children, PARTS.grid),
      xAxis: firstPartProps<XAxisProps>(children, PARTS.xAxis) ?? { dataKey: xDataKey },
      yAxis: firstPartProps<YAxisProps>(children, PARTS.yAxis),
      brush: firstPartProps<BrushProps>(children, PARTS.brush),
      legend: firstPartProps<LegendProps>(children, PARTS.legend),
      tooltip: firstPartProps<TooltipProps>(children, PARTS.tooltip),
      visibleBars: parsedBars.length > 0 ? parsedBars : Object.keys(config).map((dataKey) => ({ dataKey })),
    };
  }, [children, config, xDataKey]);
  const optionKey = stableChartKey({
    data,
    config,
    mode,
    xAxisKey: parts.xAxis.dataKey,
    bars: parts.visibleBars.map((bar) => bar.dataKey),
    grid: Boolean(parts.grid),
    brush: Boolean(parts.brush),
    legend: parts.legend,
    tooltip: Boolean(parts.tooltip),
  });
  const option = useMemo(
    () =>
      buildBarOption({
        data,
        config,
        mode,
        grid: parts.grid,
        xAxis: parts.xAxis,
        yAxis: parts.yAxis,
        brush: parts.brush,
        legend: parts.legend,
        tooltip: parts.tooltip,
        bars: parts.visibleBars,
      }),
    [config, data, mode, parts],
  );

  return <EChartsRenderer key={optionKey} option={option} className={className} />;
}

export const EChartsBarChart = Object.assign(EChartsBarChartRoot, {
  Grid: createChartPart<GridProps>(PARTS.grid),
  XAxis: createChartPart<XAxisProps>(PARTS.xAxis),
  YAxis: createChartPart<YAxisProps>(PARTS.yAxis),
  Brush: createChartPart<BrushProps>(PARTS.brush),
  Legend: createChartPart<LegendProps>(PARTS.legend),
  Tooltip: createChartPart<TooltipProps>(PARTS.tooltip),
  Bar: createChartPart<BarProps>(PARTS.bar),
});
