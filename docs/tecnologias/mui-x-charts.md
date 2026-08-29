# MUI X Charts — avaliado, não adotado

**O que é:** pacote de gráficos React da MUI X para visualização de dados:
linha, barra, pizza, scatter, gauge, sparkline. Documentação oficial em
[MUI X Charts](https://mui.com/x/react-charts/).

**Por que não entrou:** a spec original de relatórios propunha `LineChart`
do MUI X Charts pra evolução temporal. Decisão real: **não** — precisaria
de `@mui/material` + `@emotion/react` + `@emotion/styled`, reintroduzindo
exatamente o stack que este projeto abandonou desde a Fase 1 (ver
[`../ROADMAP.md`](../ROADMAP.md), "Tailwind (sem MUI/shadcn)"). O tema
institucional (DaisyUI, `data-theme`) não alcançaria um gráfico MUI sem uma
ponte de tema própria — dois sistemas de cor coexistindo.

**O que ficou no lugar:** o primeiro relatório real (`/relatorios/usuarios`,
ver [`../relatorios/ARQUITETURA.md`](../relatorios/ARQUITETURA.md)) usa
`KpiCounter` (`shared/ui/relatorios/kpi-counter.tsx`) e wrappers EvilCharts
sobre `echarts` (`shared/ui/graficos/evilcharts`). A regra continua a mesma:
não retomar MUI por conveniência.
