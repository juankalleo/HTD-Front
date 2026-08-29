# TanStack Table

**O que é:** biblioteca headless para tabelas. Ela não impõe HTML nem
estilo; controla estado, modelo de linha, ordenação, paginação, filtros,
seleção e renderização tipada.

**Por que essa:** evita reimplementar comportamento de tabela em cada lista
ou relatório. Diferente de shadcn/ui e MUI X Charts (ver
[`shadcn-ui.md`](shadcn-ui.md) e [`mui-x-charts.md`](mui-x-charts.md), os
dois avaliados e **não** adotados), TanStack Table não é um design system —
é só o motor de estado, então encaixa direto na `<table>` do DaisyUI que já
existia, sem trazer segundo sistema de componente nem quebrar o tema
institucional.

**Versão:** `^8.21.3` (`package.json`). De propósito **não** a v9 (a
`latest` no momento) — v9 trocou `useReactTable`/`getCoreRowModel` por uma
API nova (`useTable`), mantendo a API v8 só como `useLegacyTable`
`@deprecated`. v8 é a versão madura, documentada, e com o mesmo shape que o
resto do ecossistema (inclusive a doc oficial do shadcn/ui) ainda referencia.

**Como importar:**

```bash
pnpm add @tanstack/react-table@^8.21.3
```

```ts
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
```

**Exemplo real** — `shared/ui/tabelas/data-table.tsx`, motor por cima dos
primitivos visuais de `shared/ui/tabelas/table.tsx` (DaisyUI, não shadcn):

```tsx
const table = useReactTable({
  data,
  columns,
  state: sorting ? { sorting } : undefined,
  onSortingChange,
  manualSorting: true, // ordenação de verdade acontece no Rails via Ransack
  getCoreRowModel: getCoreRowModel(),
});

return (
  <Table>
    <TableBody>
      {table.getRowModel().rows.map((row) => (
        <TableRow key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
```

**Convenção do projeto:** todo `<DataTable>` usa `manualSorting: true` — a
ordenação real é responsabilidade do Ransack (`q[s]=<campo> <direção>`) no
backend, não do TanStack no client. Detalhe completo em
[`../relatorios/ARQUITETURA.md`](../relatorios/ARQUITETURA.md) e [`../TABELAS.md`](../TABELAS.md).
