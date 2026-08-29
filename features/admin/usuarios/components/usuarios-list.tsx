"use client";

import { useState } from "react";
import Link from "next/link";
import type { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table";
import { ROUTES } from "@/lib/routes";
import { Button, confirmDialog, DataTable, FilterSelect, PageTitle, Pagination, ResultsCount, SearchInput } from "@/shared/ui";
import { useTiposUsuario } from "@/features/admin/tipos-usuario/hooks/use-tipos-usuario";
import { useUsuarios } from "../hooks/use-usuarios";
import { useDeleteUsuario } from "../hooks/use-delete-usuario";
import type { Usuario } from "../types";

export function UsuariosList() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [tipoUsuarioId, setTipoUsuarioId] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading } = useUsuarios(page, busca, tipoUsuarioId, sorting);
  const { data: tipos } = useTiposUsuario();
  const { mutate: excluir, isPending: isDeleting } = useDeleteUsuario();

  async function confirmarExclusao(usuario: Usuario) {
    const confirmado = await confirmDialog({
      title: "Excluir usuário",
      text: `Excluir o usuário "${usuario.nome}"? Essa ação não pode ser desfeita.`,
      icon: "warning",
      confirmButtonText: "Excluir",
      confirmVariant: "destructive",
    });

    if (confirmado) excluir(usuario.id);
  }

  function handleBusca(valor: string) {
    setBusca(valor);
    setPage(1);
  }

  function handleFiltroTipo(valor: string) {
    setTipoUsuarioId(valor);
    setPage(1);
  }

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((atual) => (typeof updater === "function" ? updater(atual) : updater));
    setPage(1);
  };

  const columns: ColumnDef<Usuario, unknown>[] = [
    { id: "nome", accessorKey: "nome", header: "Nome" },
    {
      id: "tipo",
      header: "Tipo",
      enableSorting: false,
      cell: ({ row }) => row.original.a_tipo_usuario?.descricao ?? "—",
    },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Link href={ROUTES.edit_m_usuario_path(row.original.id)} className="btn btn-ghost btn-xs">
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
        <PageTitle>Usuários</PageTitle>
        <Link href={ROUTES.new_m_usuario_path} className="btn btn-primary btn-sm">
          Novo usuário
        </Link>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <SearchInput valor={busca} onChange={handleBusca} placeholder="Buscar por nome..." />
        <FilterSelect
          label="Tipo"
          valor={tipoUsuarioId}
          opcoes={tipos?.items.map((tipo) => ({ valor: String(tipo.id), label: tipo.descricao })) ?? []}
          onChange={handleFiltroTipo}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage="Nenhum usuário encontrado."
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
