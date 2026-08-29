"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Cell,
  type ColumnDef,
  type SortingState,
  type OnChangeFn,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "@/theme/icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

/**
 * Tabela padrão das listas admin — TanStack Table cuida do comportamento e
 * os primitivos `Table*` seguem o shape do shadcn/ui com acabamento Tailwind.
 * `manualSorting: true` de propósito: a ordenação real acontece no backend
 * via Ransack (`q[s]=<campo> <direção>`); o componente só controla o clique
 * no cabeçalho e repassa pra fora.
 */
function dataLabel<T>(cell: Cell<T, unknown>) {
  const header = cell.column.columnDef.header;
  return typeof header === "string" ? header : undefined;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage,
  sorting,
  onSortingChange,
}: {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage: string;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
}) {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table retorna funções internas; este componente é o adaptador isolado do projeto.
  const table = useReactTable({
    data,
    columns,
    state: sorting ? { sorting } : undefined,
    onSortingChange,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const colSpan = columns.length;

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const sortable = header.column.getCanSort();
              const sortDirection = header.column.getIsSorted();
              return (
                <TableHead
                  key={header.id}
                  className={sortable ? "cursor-pointer select-none" : undefined}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder ? null : (
                    <span className="inline-flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sortable &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : sortDirection === "desc" ? (
                          <ArrowDown className="size-3.5" />
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-30" />
                        ))}
                    </span>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={colSpan} className="py-8 text-center text-base-content/60">
              Carregando...
            </TableCell>
          </TableRow>
        )}
        {!isLoading && data.length === 0 && (
          <TableRow>
            <TableCell colSpan={colSpan} className="py-8 text-center text-base-content/60">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
        {!isLoading &&
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} data-label={dataLabel(cell)}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
