"use client";

import { useState } from "react";
import Link from "next/link";
import type { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table";
import { ROUTES } from "@/lib/routes";
import { Button, confirmDialog, DataTable, PageTitle, Pagination, ResultsCount, SearchInput } from "@/shared/ui";
import { usePapeis } from "../hooks/use-papeis";
import { useDeletePapel } from "../hooks/use-delete-papel";
import type { APapel } from "../types";

export function PapeisList() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading } = usePapeis(page, busca, sorting);
  const { mutate: excluir, isPending: isDeleting } = useDeletePapel();

  async function confirmarExclusao(papel: APapel) {
    const confirmado = await confirmDialog({
      title: "Excluir papel",
      text: `Excluir o papel "${papel.nome}"? Isso remove os vínculos de permissão dele.`,
      icon: "warning",
      confirmButtonText: "Excluir",
      confirmVariant: "destructive",
    });

    if (confirmado) excluir(papel.id);
  }

  function handleBusca(valor: string) {
    setBusca(valor);
    setPage(1);
  }

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((atual) => (typeof updater === "function" ? updater(atual) : updater));
    setPage(1);
  };

  const columns: ColumnDef<APapel, unknown>[] = [
    { id: "nome", accessorKey: "nome", header: "Nome" },
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
        <div className="flex justify-end gap-2">
          <Link href={ROUTES.a_papel_permissoes_path(row.original.id)} className="btn btn-ghost btn-xs">
            Permissões
          </Link>
          <Link href={ROUTES.edit_a_papel_path(row.original.id)} className="btn btn-ghost btn-xs">
            Editar
          </Link>
          <Button variant="destructive" size="xs" disabled={isDeleting} onClick={() => void confirmarExclusao(row.original)}>
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <PageTitle>Papéis</PageTitle>
        <Link href={ROUTES.new_a_papel_path} className="btn btn-primary btn-sm">
          Novo papel
        </Link>
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
        onSortingChange={handleSortingChange}
      />

      {data && (
        <div className="mt-2 flex items-center justify-between">
          <ResultsCount pagy={data.pagy} />
        </div>
      )}
      {data && <Pagination page={page} totalPages={data.pagy.total_pages} onPageChange={setPage} />}
    </div>
  );
}
