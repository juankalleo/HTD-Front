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

type LineChartProps = {
  data: ChartDatum[];
  config: ChartConfig;
  className?: string;
  xDataKey: string;
  curveType?: "smooth" | "linear";
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

type LineProps = {
  dataKey: string;
  strokeVariant?: "solid" | "dashed" | "dotted";
  strokeWidth?: number;
  isClickable?: boolean;
  children?: ReactNode;
};

type DotProps = {
  variant?: "default" | "border" | "colored-border";
};

const PARTS = {
  grid: "line-grid",
  xAxis: "line-x-axis",
  yAxis: "line-y-axis",
  brush: "line-brush",
  legend: "line-legend",
  tooltip: "line-tooltip",
  line: "line-series",
  dot: "line-dot",
  activeDot: "line-active-dot",
};

function buildLineOption({
  data,
  config,
  mode,
  curveType,
  grid,
  xAxis,
  yAxis,
  brush,
  legend,
  tooltip,
  lines,
}: {
  data: ChartDatum[];
  config: ChartConfig;
  mode: "light" | "dark";
  curveType?: "smooth" | "linear";
  grid?: GridProps;
  xAxis: XAxisProps;
  yAxis?: YAxisProps;
  brush?: BrushProps;
  legend?: LegendProps;
  tooltip?: TooltipProps;
  lines: LineProps[];
}): EChartsOption {
  const colors = lines.map((line, index) => seriesColor(config, line.dataKey, mode, index));
  const labelColor = mode === "dark" ? "#cbd5e1" : "#475569";
  const mutedColor = mode === "dark" ? "rgba(148, 163, 184, 0.24)" : "rgba(100, 116, 139, 0.22)";

  return {
    animationDuration: 600,
    color: colors,
    grid: { left: 40, right: 20, top: legend ? 44 : 18, bottom: brush ? 58 : 32 },
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
    tooltip: tooltip ? { trigger: "axis", confine: true } : undefined,
    xAxis: {
      type: "category",
      boundaryGap: false,
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
    series: lines.map((line, index) => {
      const dot = firstPartProps<DotProps>(line.children, PARTS.dot);
      const activeDot = firstPartProps<DotProps>(line.children, PARTS.activeDot);
      const color = colors[index];

      return {
        type: "line",
        name: seriesLabel(config, line.dataKey),
        data: data.map((item) => toNumber(item[line.dataKey])),
        smooth: curveType !== "linear",
        symbol: dot ? "circle" : "none",
        symbolSize: dot ? 7 : 0,
        lineStyle: { width: line.strokeWidth ?? 3, type: line.strokeVariant === "dashed" || line.strokeVariant === "dotted" ? line.strokeVariant : "solid" },
        itemStyle: {
          color: dot?.variant === "border" || dot?.variant === "colored-border" ? mode === "dark" ? "#111827" : "#ffffff" : color,
          borderColor: color,
          borderWidth: dot?.variant === "border" || dot?.variant === "colored-border" ? 2 : 0,
        },
        emphasis: {
          focus: line.isClickable ? ("series" as const) : undefined,
          scale: Boolean(activeDot),
          itemStyle: {
            color,
            borderColor: mode === "dark" ? "#020617" : "#ffffff",
            borderWidth: activeDot?.variant === "colored-border" ? 3 : 2,
          },
        },
      };
    }),
  };
}

function EChartsLineChartRoot({ data, config, className, xDataKey, curveType = "smooth", children }: LineChartProps) {
  const mode = useChartThemeMode();
  const parts = useMemo(() => {
    const parsedLines = getPartProps<LineProps>(children, PARTS.line);

    return {
      grid: firstPartProps<GridProps>(children, PARTS.grid),
      xAxis: firstPartProps<XAxisProps>(children, PARTS.xAxis) ?? { dataKey: xDataKey },
      yAxis: firstPartProps<YAxisProps>(children, PARTS.yAxis),
      brush: firstPartProps<BrushProps>(children, PARTS.brush),
      legend: firstPartProps<LegendProps>(children, PARTS.legend),
      tooltip: firstPartProps<TooltipProps>(children, PARTS.tooltip),
      visibleLines: parsedLines.length > 0 ? parsedLines : Object.keys(config).map((dataKey) => ({ dataKey })),
    };
  }, [children, config, xDataKey]);
  const optionKey = stableChartKey({
    data,
    config,
    mode,
    curveType,
    grid: Boolean(parts.grid),
    xAxisKey: parts.xAxis.dataKey,
    yAxis: Boolean(parts.yAxis),
    lines: parts.visibleLines.map((line) => line.dataKey),
    brush: Boolean(parts.brush),
    legend: parts.legend,
    tooltip: Boolean(parts.tooltip),
  });
  const option = useMemo(
    () =>
      buildLineOption({
        data,
        config,
        mode,
        curveType,
        grid: parts.grid,
        xAxis: parts.xAxis,
        yAxis: parts.yAxis,
        brush: parts.brush,
        legend: parts.legend,
        tooltip: parts.tooltip,
        lines: parts.visibleLines,
      }),
    [config, curveType, data, mode, parts],
  );

  return <EChartsRenderer key={optionKey} option={option} className={className} />;
}

export const EChartsLineChart = Object.assign(EChartsLineChartRoot, {
  Grid: createChartPart<GridProps>(PARTS.grid),
  XAxis: createChartPart<XAxisProps>(PARTS.xAxis),
  YAxis: createChartPart<YAxisProps>(PARTS.yAxis),
  Brush: createChartPart<BrushProps>(PARTS.brush),
  Legend: createChartPart<LegendProps>(PARTS.legend),
  Tooltip: createChartPart<TooltipProps>(PARTS.tooltip),
  Line: createChartPart<LineProps>(PARTS.line),
  Dot: createChartPart<DotProps>(PARTS.dot),
  ActiveDot: createChartPart<DotProps>(PARTS.activeDot),
});
