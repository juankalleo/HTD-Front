# Relatórios

> Primeiro relatório real do padrão: `/relatorios/usuarios`. Nasceu de uma
> spec inicial na wiki que trazia MUI X Charts + shadcn/ui + campos que não
> existem no `User` real (`status`, `perfil`, `último acesso`) — os dois
> primeiros foram descartados (ver "Decisões" abaixo), o terceiro foi
> corrigido pros campos reais antes de qualquer linha de código.

## Decisões

**TanStack Table sim, ECharts sim; MUI X Charts e pacote shadcn/ui não.** O
projeto inteiro usa DaisyUI (ver
[`../tecnologias/daisyui.md`](../tecnologias/daisyui.md)); trazer MUI
(`@mui/material`+`@emotion`) ou o pacote `shadcn/ui` criaria um segundo
sistema de design rodando só nos relatórios. TanStack Table é headless e
ECharts entra atrás de wrappers locais EvilCharts, então ambos respeitam o
tema institucional (`data-theme`, `--app-scale`, ver
[`../CONFIGURACAO-INSTITUCIONAL.md`](../CONFIGURACAO-INSTITUCIONAL.md)) sem
trocar o design system.

**Sem campo inventado.** `UserSerializer` (backend) só devolve `id, nome,
a_tipo_usuario` — o relatório de usuários mostra exatamente isso, nada de
`status`/`perfil`/`último acesso`, que não existem no `User` real. KPI por
tipo e total vêm de contagem real (`pagy.total_count` filtrado), não de
número calculado no front.

## `shared/ui/tabelas/data-table.tsx` + `shared/ui/tabelas/table.tsx`

Duas peças, papéis diferentes:

- `shared/ui/tabelas/table.tsx` — primitivos puramente visuais (`Table`,
  `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`),
  Tailwind + tokens do DaisyUI (`border-base-300`, `text-base-content`...).
  Zero comportamento.
- `shared/ui/tabelas/data-table.tsx` — o motor: `useReactTable` do TanStack
  (`getCoreRowModel`, cabeçalho clicável pra ordenar) renderizando dentro
  dos primitivos acima via `flexRender`.

```tsx
<DataTable
  columns={columns}
  data={data?.items ?? []}
  isLoading={isLoading}
  emptyMessage="Nenhum usuário encontrado."
  sorting={sorting}
  onSortingChange={handleSortingChange}
/>
```

`manualSorting: true` — a ordenação de verdade acontece no Rails via
Ransack (`q[s]=<campo> asc|desc`, ver `lib/ransack.ts#sortingParaRansack`),
o `DataTable` só controla o estado do clique no cabeçalho e repassa pra
fora. Ao mudar a ordenação, a página volta pra 1 (mesmo raciocínio de
busca/filtro, ver [`TABELAS.md`](TABELAS.md)).

O padrão foi aplicado retroativamente nas 4 listas admin que já existiam
(usuários, tipos de usuário, papéis, permissões) — não é exclusivo de
relatório, é o motor de tabela do projeto inteiro a partir de agora.

## KPIs sem endpoint de agregação

`features/relatorios/usuarios/hooks/use-relatorio-usuarios-kpis.ts` não tem
nenhum endpoint de agregação do lado da API — pede `per_page: 1` (só
interessa `pagy.total_count`, não as linhas) uma vez sem filtro (total) e
uma vez por tipo de usuário (`q[a_tipo_usuario_id_eq]`), via `useQueries`.
N+1, mas aceitável: tipo de usuário é vocabulário curto e fixo, nunca uma
tabela que cresce sem limite.

## Gráficos com EvilCharts sobre ECharts

Os wrappers ficam em `shared/ui/graficos/evilcharts` e exportam a API usada
na tela (`EChartsLineChart`, `EChartsRadarChart`, `ChartConfig`). O relatório
de usuários não inventa série temporal: os dois gráficos são montados em cima
dos KPIs reais por tipo de usuário, comparando a quantidade por tipo com a
média geral por tipo.

## PDF com Puppeteer — a única rota em `app/api/*`

Esse projeto removeu `app/api/*` inteiro na Fase 2 (ver
[`ROADMAP.md`](ROADMAP.md#decisão-revista-sem-route-handler--proxy-nextjs))
— o browser fala direto com o Rails, sem proxy Next.js no meio. A rota de
PDF (`app/api/relatorios/pdf/route.ts`) é a **única exceção**, e por um
motivo técnico, não arquitetural: gerar PDF via Chromium headless precisa
de runtime Node, que só o próprio Next.js oferece aqui — o Rails nunca
entra nesse fluxo, não é chamado por essa rota nem chama ela.

Rota única e **genérica** pra qualquer relatório — não é mais uma rota por
relatório. Quem varia por relatório é o **payload de dados**
(`RelatorioPdfDados`) e o **nome do estilo** (`template`); o motor
(Puppeteer, `page.pdf()`) é sempre o mesmo. Motor separado de estilo — e
mais de um estilo possível — é assunto de
[`../ESTILOS-DE-PDF.md`](../ESTILOS-DE-PDF.md), não repetido aqui.

```
Client Component (relatorio-usuarios-view.tsx)
   │  já tem os dados na tela (useUsuarios/useRelatorioUsuariosKpis)
   │  no clique de exportar, busca o filtro INTEIRO (per_page alto),
   │  não só a página visível — o PDF reflete o filtro, não a paginação
   ▼
services/api-relatorio-pdf.ts → POST /api/relatorios/pdf (local, { template, ...dados })
   ▼
app/api/relatorios/pdf/route.ts (runtime nodejs)
   │  lib/server/relatorio-pdf/ escolhe o template certo, monta o HTML
   ▼
Chromium headless → page.pdf() → bytes do PDF de volta pro browser
```

Detalhes que já causaram erro real na primeira tentativa (Puppeteer 25.x):
`page.setContent()` só aceita `waitUntil: "load"`/`"domcontentloaded"` —
`"networkidle0"` é válido em `page.goto()`, não em `setContent()`. O
navegador Chromium (`browserPromise` module-level, em
`lib/server/relatorio-pdf/core.ts`) fica vivo entre requests — nunca cria
um novo a cada chamada, só a `page` é por request (`browser.newPage()` +
`page.close()` no `finally`).

**Instalação:** `puppeteer` baixa um Chromium próprio no `pnpm install`,
mas o pnpm bloqueia scripts de post-install por padrão — precisou de
`onlyBuiltDependencies: [puppeteer]` em `pnpm-workspace.yaml` (ao lado da
lista já existente de `ignoredBuiltDependencies`, não substituindo ela) +
`pnpm rebuild puppeteer` uma vez pra baixar o binário.

**Segurança:** rota exige sessão válida, valida o corpo inteiro (Zod) e
escapa toda interpolação nos templates — os três pontos têm teste real
feito contra a rota rodando (payload de XSS, requisição sem token,
`filename` com CRLF), não só leitura de código. Detalhe completo em
[`../SEGURANCA-EXPORTACAO.md`](../SEGURANCA-EXPORTACAO.md).

## Checklist pra um relatório novo

1. Campos vêm só do serializer real da API — nunca inventa campo pra "ficar
   mais completo" (ver [`ADMINISTRACAO-RBAC.md`](ADMINISTRACAO-RBAC.md) pra
   outros limites reais de serializer, ex.: `User` nunca devolve `email`
   pra admin).
2. Tabela usa `DataTable` (TanStack + `shared/ui/tabelas/table.tsx`), nunca HTML de
   tabela solto nem outra lib de tabela.
3. KPI é contagem real (via `pagy.total_count` de uma query filtrada), não
   `.length` de um array já carregado nem número inventado no JSX.
4. Gráfico usa wrapper de `shared/ui/graficos/evilcharts`, nunca MUI direto.
5. PDF/Excel (se houver) é gerado no servidor via `lib/server/
   relatorio-pdf/`/`lib/server/relatorio-excel/` (rotas únicas
   `app/api/relatorios/{pdf,excel}/route.ts`, runtime `nodejs`), nunca no
   Client Component — a tela monta `RelatorioPdfDados`/`RelatorioExcelDados`
   e escolhe um `template` já existente (ver
   [`../ESTILOS-DE-PDF.md`](../ESTILOS-DE-PDF.md)/[`../ESTILOS-DE-EXCEL.md`](../ESTILOS-DE-EXCEL.md));
   só cria um template novo se nenhum dos existentes servir. Cada relatório
   ganha o próprio par hook e página de preview
   (`features/relatorios/<relatorio>/hooks/use-relatorio-<relatorio>-{pdf,excel}-preview.ts`,
   `.../components/relatorio-<relatorio>-{pdf,excel}-preview-page.tsx`)
   — rota própria, nunca modal, nunca download direto no clique (ver
   [`../SEGURANCA-EXPORTACAO.md`](../SEGURANCA-EXPORTACAO.md)).
