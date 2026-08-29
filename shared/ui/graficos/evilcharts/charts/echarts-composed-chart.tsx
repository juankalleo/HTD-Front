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

type ComposedChartProps = {
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

type LineProps = {
  dataKey: string;
  strokeWidth?: number;
  isClickable?: boolean;
};

const PARTS = {
  grid: "composed-grid",
  xAxis: "composed-x-axis",
  yAxis: "composed-y-axis",
  legend: "composed-legend",
  tooltip: "composed-tooltip",
  bar: "composed-bar-series",
  line: "composed-line-series",
};

function buildComposedOption({
  data,
  config,
  mode,
  grid,
  xAxis,
  yAxis,
  legend,
  tooltip,
  bars,
  lines,
}: {
  data: ChartDatum[];
  config: ChartConfig;
  mode: "light" | "dark";
  grid?: GridProps;
  xAxis: XAxisProps;
  yAxis?: YAxisProps;
  legend?: LegendProps;
  tooltip?: TooltipProps;
  bars: BarProps[];
  lines: LineProps[];
}): EChartsOption {
  const seriesItems = [...bars, ...lines];
  const colors = seriesItems.map((item, index) => seriesColor(config, item.dataKey, mode, index));
  const labelColor = mode === "dark" ? "#cbd5e1" : "#475569";
  const mutedColor = mode === "dark" ? "rgba(148, 163, 184, 0.24)" : "rgba(100, 116, 139, 0.22)";

  return {
    animationDuration: 600,
    color: colors,
    grid: { left: 42, right: 22, top: legend ? 44 : 18, bottom: 34 },
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
    series: [
      ...bars.map((bar, index) => {
        const color = colors[index];
        return {
          type: "bar" as const,
          name: seriesLabel(config, bar.dataKey),
          data: data.map((item) => toNumber(item[bar.dataKey])),
          barMaxWidth: bar.barSize ?? 32,
          itemStyle: {
            color,
            borderRadius: [5, 5, 0, 0],
            decal: bar.variant === "hatched" ? { symbol: "rect", dashArrayX: [2, 0], dashArrayY: [4, 4], color: mode === "dark" ? "rgba(2, 6, 23, 0.35)" : "rgba(255, 255, 255, 0.55)" } : undefined,
          },
          emphasis: { focus: bar.isClickable ? ("series" as const) : undefined },
        };
      }),
      ...lines.map((line, index) => {
        const color = colors[bars.length + index];
        return {
          type: "line" as const,
          name: seriesLabel(config, line.dataKey),
          data: data.map((item) => toNumber(item[line.dataKey])),
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: line.strokeWidth ?? 2.5, color },
          itemStyle: { color, borderColor: mode === "dark" ? "#020617" : "#ffffff", borderWidth: 2 },
          emphasis: { focus: line.isClickable ? ("series" as const) : undefined },
        };
      }),
    ],
  };
}

function EChartsComposedChartRoot({ data, config, className, xDataKey, children }: ComposedChartProps) {
  const mode = useChartThemeMode();
  const parts = useMemo(() => ({
    grid: firstPartProps<GridProps>(children, PARTS.grid),
    xAxis: firstPartProps<XAxisProps>(children, PARTS.xAxis) ?? { dataKey: xDataKey },
    yAxis: firstPartProps<YAxisProps>(children, PARTS.yAxis),
    legend: firstPartProps<LegendProps>(children, PARTS.legend),
    tooltip: firstPartProps<TooltipProps>(children, PARTS.tooltip),
    bars: getPartProps<BarProps>(children, PARTS.bar),
    lines: getPartProps<LineProps>(children, PARTS.line),
  }), [children, xDataKey]);
  const bars = parts.bars.length > 0 ? parts.bars : Object.keys(config).slice(0, 1).map((dataKey) => ({ dataKey }));
  const lines = parts.lines;
  const optionKey = stableChartKey({
    data,
    config,
    mode,
    xAxisKey: parts.xAxis.dataKey,
    bars: bars.map((bar) => bar.dataKey),
    lines: lines.map((line) => line.dataKey),
    grid: Boolean(parts.grid),
    legend: parts.legend,
    tooltip: Boolean(parts.tooltip),
  });
  const option = useMemo(
    () =>
      buildComposedOption({
        data,
        config,
        mode,
        grid: parts.grid,
        xAxis: parts.xAxis,
        yAxis: parts.yAxis,
        legend: parts.legend,
        tooltip: parts.tooltip,
        bars,
        lines,
      }),
    [bars, config, data, lines, mode, parts],
  );

  return <EChartsRenderer key={optionKey} option={option} className={className} />;
}

export const EChartsComposedChart = Object.assign(EChartsComposedChartRoot, {
  Grid: createChartPart<GridProps>(PARTS.grid),
  XAxis: createChartPart<XAxisProps>(PARTS.xAxis),
  YAxis: createChartPart<YAxisProps>(PARTS.yAxis),
  Legend: createChartPart<LegendProps>(PARTS.legend),
  Tooltip: createChartPart<TooltipProps>(PARTS.tooltip),
  Bar: createChartPart<BarProps>(PARTS.bar),
  Line: createChartPart<LineProps>(PARTS.line),
});
