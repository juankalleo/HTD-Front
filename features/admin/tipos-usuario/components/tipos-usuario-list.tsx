"use client";

import { useState } from "react";
import Link from "next/link";
import type { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table";
import { ROUTES } from "@/lib/routes";
import { Button, confirmDialog, DataTable, PageTitle, Pagination, ResultsCount, SearchInput } from "@/shared/ui";
import { useTiposUsuarioPaginado } from "../hooks/use-tipos-usuario-paginado";
import { useDeleteTipoUsuario } from "../hooks/use-delete-tipo-usuario";
import type { ATipoUsuario } from "../types";

export function TiposUsuarioList() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading } = useTiposUsuarioPaginado(page, busca, sorting);
  const { mutate: excluir, isPending: isDeleting } = useDeleteTipoUsuario();

  async function confirmarExclusao(tipoUsuario: ATipoUsuario) {
    const confirmado = await confirmDialog({
      title: "Excluir tipo de usuário",
      text: `Excluir o tipo de usuário "${tipoUsuario.descricao}"? Essa ação não pode ser desfeita.`,
      icon: "warning",
      confirmButtonText: "Excluir",
      confirmVariant: "destructive",
    });

    if (confirmado) excluir(tipoUsuario.id);
  }

  function handleBusca(valor: string) {
    setBusca(valor);
    setPage(1);
  }

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((atual) => (typeof updater === "function" ? updater(atual) : updater));
    setPage(1);
  };

  const columns: ColumnDef<ATipoUsuario, unknown>[] = [
    { id: "descricao", accessorKey: "descricao", header: "Descrição" },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Link href={ROUTES.edit_a_tipo_usuario_path(row.original.id)} className="btn btn-ghost btn-xs">
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
        <PageTitle>Tipos de usuário</PageTitle>
        <Link href={ROUTES.new_a_tipo_usuario_path} className="btn btn-primary btn-sm">
          Novo tipo
        </Link>
      </div>

      <div className="mb-3">
        <SearchInput valor={busca} onChange={handleBusca} placeholder="Buscar por descrição..." />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage="Nenhum tipo de usuário encontrado."
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
