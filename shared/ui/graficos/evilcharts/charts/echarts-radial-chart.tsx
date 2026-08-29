"use client";

import { useMemo, type ReactNode } from "react";
import type { EChartsOption } from "echarts";
import {
  createChartPart,
  EChartsRenderer,
  firstPartProps,
  seriesColor,
  stableChartKey,
  toNumber,
  toText,
  useChartThemeMode,
  type ChartConfig,
  type ChartDatum,
} from "../chart-utils";

export type { ChartConfig } from "../chart-utils";

type RadialChartProps = {
  data: ChartDatum[];
  config: ChartConfig;
  className?: string;
  nameKey: string;
  max?: number;
  innerRadius?: string;
  outerRadius?: string;
  children?: ReactNode;
};

type RadialBarProps = {
  dataKey: string;
  barSize?: number;
  cornerRadius?: number;
};

const PARTS = {
  radialBar: "radial-bar-series",
};

function buildRadialOption({
  data,
  config,
  mode,
  nameKey,
  max,
  innerRadius,
  outerRadius,
  radialBar,
}: {
  data: ChartDatum[];
  config: ChartConfig;
  mode: "light" | "dark";
  nameKey: string;
  max: number;
  innerRadius: string;
  outerRadius: string;
  radialBar: RadialBarProps;
}): EChartsOption {
  const labels = data.map((item) => toText(item[nameKey]));
  const values = data.map((item) => toNumber(item[radialBar.dataKey]));
  const trackColor = mode === "dark" ? "rgba(148, 163, 184, 0.18)" : "rgba(148, 163, 184, 0.24)";

  return {
    animationDuration: 500,
    polar: {
      radius: [innerRadius, outerRadius],
      center: ["50%", "50%"],
    },
    angleAxis: {
      type: "value",
      startAngle: 90,
      max,
      show: false,
    },
    radiusAxis: {
      type: "category",
      data: labels,
      show: false,
    },
    tooltip: { show: false },
    series: [
      {
        type: "bar" as const,
        coordinateSystem: "polar",
        data: values.map(() => max),
        barWidth: radialBar.barSize ?? 8,
        silent: true,
        roundCap: Boolean(radialBar.cornerRadius),
        itemStyle: { color: trackColor },
        z: 1,
      },
      {
        type: "bar" as const,
        coordinateSystem: "polar",
        data: values,
        barWidth: radialBar.barSize ?? 8,
        roundCap: Boolean(radialBar.cornerRadius),
        itemStyle: {
          color: (params: { dataIndex: number }) => {
            const key = labels[params.dataIndex] ?? radialBar.dataKey;
            return seriesColor(config, key, mode, params.dataIndex);
          },
        },
        z: 2,
      },
    ],
  };
}

function EChartsRadialChartRoot({
  data,
  config,
  className,
  nameKey,
  max = 100,
  innerRadius = "68%",
  outerRadius = "100%",
  children,
}: RadialChartProps) {
  const mode = useChartThemeMode();
  const radialBar = useMemo(() => firstPartProps<RadialBarProps>(children, PARTS.radialBar) ?? { dataKey: "value" }, [children]);
  const optionKey = stableChartKey({
    data,
    config,
    mode,
    nameKey,
    max,
    innerRadius,
    outerRadius,
    radialBar,
  });
  const option = useMemo(
    () =>
      buildRadialOption({
        data,
        config,
        mode,
        nameKey,
        max,
        innerRadius,
        outerRadius,
        radialBar,
      }),
    [config, data, innerRadius, max, mode, nameKey, outerRadius, radialBar],
  );

  return <EChartsRenderer key={optionKey} option={option} className={className} />;
}

export const EChartsRadialChart = Object.assign(EChartsRadialChartRoot, {
  RadialBar: createChartPart<RadialBarProps>(PARTS.radialBar),
});
