# shadcn/ui — avaliado, não adotado

**O que é:** coleção de componentes copiáveis para React/Next.js (Radix
como base de acessibilidade, Tailwind como acabamento). Diferente de uma
biblioteca fechada, os componentes entram no repositório e podem ser
ajustados ao padrão visual do projeto.

**Por que não entrou:** a spec original de relatórios propunha `Table` do
shadcn/ui como base visual das tabelas. Decisão real, depois de avaliar:
**não** — o `base-front` inteiro é DaisyUI (ver
[`daisyui.md`](daisyui.md)); trazer shadcn/ui criaria um segundo sistema de
design rodando só em relatórios, e o tema institucional (`data-theme`,
escala, fonte — ver
[`../CONFIGURACAO-INSTITUCIONAL.md`](../CONFIGURACAO-INSTITUCIONAL.md)) não
alcançaria esses componentes sem uma ponte de tema própria.

**O que ficou no lugar:** `shared/ui/tabelas/table.tsx` — os mesmos nomes de
componente que o shadcn/ui usa (`Table`, `TableHeader`, `TableBody`,
`TableRow`, `TableHead`, `TableCell`), só que implementados com `<table>`
HTML puro + Tailwind + tokens do DaisyUI, zero dependência nova. A
convenção de **nomear** os pedaços da tabela dessa forma (composição
granular em vez de uma `<table>` monolítica) foi a parte boa que ficou; o
pacote `shadcn/ui` em si, não. Ver
[`../relatorios/ARQUITETURA.md`](../relatorios/ARQUITETURA.md#shareduitabelasdata-tabletsx--shareduitabelastabletsx).
