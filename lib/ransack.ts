import type { SortingState } from "@tanstack/react-table";

/**
 * Converte o `SortingState` do TanStack Table (`DataTable`, ver
 * `shared/ui/tabelas/data-table.tsx`) pro parâmetro `q[s]` do Ransack
 * (`"<campo> asc"`/`"<campo> desc"`). Só a primeira coluna importa — nenhuma
 * lista admin precisa de sort multi-coluna hoje.
 */
export function sortingParaRansack(sorting: SortingState): string | undefined {
  const [coluna] = sorting;
  if (!coluna) return undefined;
  return `${coluna.id} ${coluna.desc ? "desc" : "asc"}`;
}
