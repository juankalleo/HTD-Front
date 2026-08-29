# UI compartilhada

`shared/ui` guarda componentes reutilizáveis de interface. A pasta raiz não
recebe componente solto: ela só tem `index.ts` e subpastas por papel.

```text
shared/ui/
  filtros/
    filter-select.tsx
    search-input.tsx
  graficos/
    evilcharts/
      charts/
        echarts-line-chart.tsx
        echarts-radar-chart.tsx
  relatorios/
    kpi-counter.tsx
    report-chart-card.tsx
  sistema/
    image-cropper-modal.tsx
    pagination.tsx
    results-count.tsx
    toast.tsx
  tabelas/
    data-table.tsx
    table.tsx
  index.ts
```

Features importam pelo barrel público:

```tsx
import { DataTable, FilterSelect, SearchInput } from "@/shared/ui";
```

Dentro da própria `shared/ui`, componentes usam import relativo para evitar
ciclo pelo barrel. Exemplo: `data-table.tsx` importa `./table`, e
`image-cropper-modal.tsx` importa `./toast`.

## Fronteira

- `filtros/`: controles de busca/filtro usados por listas e relatórios.
- `tabelas/`: primitivos de tabela e o adapter TanStack Table.
- `relatorios/`: blocos de composição de relatório, como KPI e card de gráfico.
- `graficos/`: wrappers de biblioteca de gráfico, hoje ECharts no formato
  EvilCharts.
- `sistema/`: componentes transversais de aplicação, feedback e utilitários
  visuais que não pertencem a uma feature específica.

Peça específica de domínio continua dentro de `features/<area>/<modulo>/`.
Exemplo: `RelatorioUsuariosCharts` fica em
`features/relatorios/usuarios/components/`, porque só sabe montar gráficos
com o contrato de usuários.

## Atomic Design — avaliado, não adotado

**O que é:** metodologia que divide componente de UI em 5 camadas fixas —
átomos, moléculas, organismos, templates, páginas — pela composição
estrutural (quantos elementos filhos, se tem estado próprio), não pelo papel
que o componente cumpre no produto.

**Por que não entrou:** a árvore acima já é uma taxonomia deliberada, só que
organizada por **papel** (`filtros`, `tabelas`, `relatorios`, `graficos`,
`sistema`) em vez de por camada estrutural. Encaixar o que já existe em
átomos/moléculas/organismos exigiria reclassificar cada componente pela
pergunta errada pro que a "Fronteira" acima já responde bem — `SearchInput`
é "controle de busca/filtro" (útil pra quem procura um componente), não
"molécula" (não diz nada sobre pra que ele serve). O mesmo raciocínio já
decidiu não trazer [shadcn/ui](tecnologias/shadcn-ui.md): trocar uma
convenção interna coerente por uma de fora só pra ter o nome "padrão de
mercado" não é ganho real se a de dentro já resolve o mesmo problema.

**O que fica:** a árvore por papel, como está. Se o projeto crescer a ponto
de "papel" parar de bastar como critério (por exemplo, um componente
genérico demais pra caber em qualquer pasta acima), aí sim vale reavaliar —
não antes.
