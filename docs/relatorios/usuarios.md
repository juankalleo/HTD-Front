# Relatórios de usuários

Primeiro relatório do padrão — referência pros próximos. Implementado em
`/relatorios/usuarios`, `features/relatorios/usuarios/`. Detalhe completo
das decisões (TanStack Table em vez de MUI/shadcn, Puppeteer como única
exceção em `app/api/*`) em [`ARQUITETURA.md`](ARQUITETURA.md) — esta
página é só o contrato de dado.

## Contrato

Só os campos que `UserSerializer` (backend) realmente devolve pra admin —
`id, nome, a_tipo_usuario`. Sem `email` (o backend nunca devolve isso em
resposta de admin, ver [`../ADMINISTRACAO-RBAC.md`](../ADMINISTRACAO-RBAC.md)),
sem `status`/`perfil`/`último acesso` (não existem no `User` real — a spec
inicial deste relatório tinha esses três campos inventados, corrigidos
antes de qualquer implementação).

```ts
// features/relatorios/usuarios/types/index.ts
import type { Usuario } from "@/features/admin/usuarios/types";

export type RelatorioUsuarioLinha = Usuario; // { id, nome, a_tipo_usuario? }

export type RelatorioUsuariosKpis = {
  total: number;
  porTipo: { tipoId: number; descricao: string; total: number }[];
};
```

## Filtros

Mesmo padrão de [`../TABELAS.md`](../TABELAS.md) — busca por nome
(`q[nome_cont]`) + filtro por tipo de usuário (`q[a_tipo_usuario_id_eq]`),
reaproveitando os hooks que a lista `/usuarios` já usa
(`useUsuarios`, `useTiposUsuario`). Nenhum filtro de período — o backend
não expõe `created_at` (nem outra data) pro admin hoje, então "novos
usuários no período" não é um filtro real ainda.

## KPIs

Sem número calculado no JSX. Cada KPI é uma contagem real
(`pagy.total_count` de uma query filtrada com `per_page: 1`) — total geral
+ um por tipo de usuário, via `useRelatorioUsuariosKpis` (N+1 controlado,
um request por tipo — aceitável porque tipo de usuário é vocabulário curto
e fixo). Renderizado com `KpiCounter`
(`shared/ui/relatorios/kpi-counter.tsx`, `stat` do DaisyUI).

```tsx
<section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
  <KpiCounter label="Total de usuários" value={kpis.total} />
  {kpis.porTipo.map((item) => (
    <KpiCounter key={item.tipoId} label={item.descricao} value={item.total} />
  ))}
</section>
```

## Gráficos

`RelatorioUsuariosCharts` usa os mesmos KPIs reais do relatório. Como o
`UserSerializer` ainda não expõe data de criação/acesso, não existe série
temporal inventada: os gráficos mostram a distribuição por tipo de usuário
e a comparação com a média por tipo.

```tsx
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

Wrappers ficam em `shared/ui/graficos/evilcharts`; a transformação dos dados
fica na feature do relatório.

## Tabela

`DataTable` (`shared/ui/tabelas/data-table.tsx`, TanStack Table +
`shared/ui/tabelas/table.tsx` — ver
[`../tecnologias/tanstack-table.md`](../tecnologias/tanstack-table.md)),
duas colunas (nome, tipo), coluna de nome ordenável (Ransack `q[s]`).

## PDF com Puppeteer, Excel com ExcelJS

"Exportar PDF" e "Exportar Excel" **não geram nada no clique** — navegam
pras rotas próprias `/relatorios/usuarios/pdf-preview` e `/relatorios/
usuarios/excel-preview` (query string carrega o filtro atual: `busca`,
`tipo`), ver [`../SEGURANCA-EXPORTACAO.md`](../SEGURANCA-EXPORTACAO.md)
pro porquê de página (não modal).

Cada página busca o **filtro inteiro** (não só a página visível —
`per_page: 1000`, imperativo, fora do ciclo normal de `useQuery`, via os
hooks `features/relatorios/usuarios/hooks/use-relatorio-usuarios-{pdf,
excel}-preview.ts`) e monta o dado (KPIs + linhas + filtro aplicado +
marca do sistema + usuário logado como emissor + timestamp) — nunca
inventa campo, mesma regra de sempre.

**PDF**: `POST /api/relatorios/pdf` assim que a página monta, template
**`institucional`** (cabeçalho com marca, cartões de resumo, tabela,
rodapé com emissor — ver [`../ESTILOS-DE-PDF.md`](../ESTILOS-DE-PDF.md)),
mostra o resultado num `<iframe>`; "Baixar PDF" é um link direto pro
blob já gerado.

**Excel**: a página mostra a **tabela dos dados de origem** direto (sem
chamar a rota — `.xlsx` não tem visualizador nativo no browser, refazer
o processo seria desperdício); só ao clicar "Baixar Excel" é que `POST
/api/relatorios/excel` roda de verdade, mesmo template `institucional` do
Excel (ver [`../ESTILOS-DE-EXCEL.md`](../ESTILOS-DE-EXCEL.md)).

## Checklist

1. Campo só existe se o serializer real devolve.
2. Filtro de tela = parâmetro de query pro backend, nunca `.filter()` local.
3. KPI = contagem real, nunca calculado no componente.
4. Gráfico = wrapper de `shared/ui/graficos`, nunca biblioteca direto na tela.
5. Tabela = `DataTable` (TanStack + `shared/ui/tabelas/table.tsx`), nunca HTML solto.
6. PDF roda em `app/api/.../route.ts` (`runtime = "nodejs"`), fecha a página no `finally`.
