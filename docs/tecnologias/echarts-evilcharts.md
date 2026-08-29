# ECharts / EvilCharts

**O que é:** `echarts` é o motor de gráfico. EvilCharts, neste projeto, é a
camada React local em `shared/ui/graficos/evilcharts`, com API de composição
parecida com os exemplos de `<EChartsLineChart.Line>` e
`<EChartsRadarChart.Radar>`.

**Por que essa:** o projeto precisava de gráficos sem puxar MUI X Charts e
sem criar outro design system. ECharts fica só como motor de canvas; o
acabamento visual continua controlado por Tailwind e tokens DaisyUI.

**Versão:** `^6.1.0` (`package.json`).

**Como importar:**

```tsx
import { EChartsLineChart, EChartsRadarChart, type ChartConfig } from "@/shared/ui";
```

**Exemplo real** — relatório de usuários:

```tsx
const chartConfig = {
  usuarios: {
    label: "Usuários",
    colors: { light: ["#2563eb"], dark: ["#60a5fa"] },
  },
  media: {
    label: "Média por tipo",
    colors: { light: ["#059669"], dark: ["#34d399"] },
  },
} satisfies ChartConfig;

<EChartsLineChart data={data} config={chartConfig} className="h-full w-full p-4" xDataKey="tipo">
  <EChartsLineChart.XAxis dataKey="tipo" tickFormatter={textoCurto} />
  <EChartsLineChart.Brush formatLabel={textoCurto} />
  <EChartsLineChart.Legend isClickable />
  <EChartsLineChart.Tooltip />
  <EChartsLineChart.Line dataKey="usuarios" strokeVariant="solid" isClickable>
    <EChartsLineChart.Dot variant="border" />
    <EChartsLineChart.ActiveDot variant="colored-border" />
  </EChartsLineChart.Line>
</EChartsLineChart>
```

**Convenção do projeto:** wrapper de gráfico fica em `shared/ui/graficos`;
componente que prepara dado de um relatório fica na feature do relatório. O
relatório de usuários, por exemplo, transforma `RelatorioUsuariosKpis` em
dados de linha/radar dentro de `features/relatorios/usuarios/components/`.
