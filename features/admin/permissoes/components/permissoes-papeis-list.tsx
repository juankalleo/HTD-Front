"use client";

import { useState } from "react";
import Link from "next/link";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { ROUTES } from "@/lib/routes";
import { DataTable, PageTitle, Pagination, ResultsCount, SearchInput } from "@/shared/ui";
import { usePapeis } from "@/features/admin/papeis/hooks/use-papeis";
import type { APapel } from "@/features/admin/papeis/types";

/** Ponto de entrada de Permissões: escolhe o papel pra abrir a matriz recurso × ação dele. */
export function PermissoesPapeisList() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading } = usePapeis(page, busca, sorting);

  function handleBusca(valor: string) {
    setBusca(valor);
    setPage(1);
  }

  const columns: ColumnDef<APapel, unknown>[] = [
    { id: "nome", accessorKey: "nome", header: "Papel" },
    {
      id: "descricao",
      accessorFn: (papel) => papel.descricao ?? "—",
      header: "Descrição",
      cell: ({ getValue }) => <span className="text-base-content/60">{getValue() as string}</span>,
    },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-right">
          <Link href={ROUTES.a_papel_permissoes_path(row.original.id)} className="btn btn-ghost btn-xs">
            Gerenciar
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-4">
        <PageTitle>Permissões</PageTitle>
        <p className="mt-1 text-sm text-base-content/60">Escolha um papel pra gerenciar as permissões dele.</p>
      </div>

      <div className="mb-3">
        <SearchInput valor={busca} onChange={handleBusca} placeholder="Buscar por nome ou descrição..." />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage="Nenhum papel encontrado."
        sorting={sorting}
        onSortingChange={setSorting}
      />
      {!isLoading && data?.items.length === 0 && (
        <p className="mt-2 text-sm text-base-content/60">
          <Link href={ROUTES.new_a_papel_path} className="link link-hover">
            Crie um papel primeiro
          </Link>
          .
        </p>
      )}

      {data && (
        <div className="mt-2 flex items-center justify-between">
          <ResultsCount pagy={data.pagy} />
        </div>
      )}
      {data && <Pagination page={page} totalPages={data.pagy.total_pages} onPageChange={setPage} />}
    </div>
  );
}
