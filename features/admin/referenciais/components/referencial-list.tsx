"use client";

import { useState } from "react";
import Link from "next/link";
import type { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table";
import { ROUTES } from "@/lib/routes";
import { Button, confirmDialog, DataTable, FilterSelect, PageTitle, Pagination, ResultsCount, SearchInput } from "@/shared/ui";
import {
  getReferencialEmptyMessage,
  getReferencialNewLabel,
  getReferencialOptionSources,
  getReferencialTitle,
  REFERENCIAIS,
} from "../config";
import { useDeleteReferencial, useReferencialList, useReferencialOptionsMap } from "../hooks/use-referenciais";
import type { ReferencialKey, ReferencialRecord } from "../types";

export function ReferencialList({ recurso }: { recurso: ReferencialKey }) {
  const config = REFERENCIAIS[recurso];
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading } = useReferencialList(recurso, page, busca, filtros, sorting);
  const { mutate: excluir, isPending: isDeleting } = useDeleteReferencial(recurso);
  const { optionsBySource } = useReferencialOptionsMap(getReferencialOptionSources(config));

  function handleBusca(valor: string) {
    setBusca(valor);
    setPage(1);
  }

  function handleFiltro(nome: string, valor: string) {
    setFiltros((atual) => ({ ...atual, [nome]: valor }));
    setPage(1);
  }

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((atual) => (typeof updater === "function" ? updater(atual) : updater));
    setPage(1);
  };

  async function confirmarExclusao(record: ReferencialRecord) {
    const label = getReferencialTitle(config, record);
    const confirmado = await confirmDialog({
      title: `Excluir ${config.singular.toLowerCase()}`,
      text: `Excluir ${config.singular.toLowerCase()} "${label}"? Essa ação não pode ser desfeita.`,
      icon: "warning",
      confirmButtonText: "Excluir",
      confirmVariant: "destructive",
    });

    if (confirmado) excluir(record.id);
  }

  const columns: ColumnDef<ReferencialRecord, unknown>[] = [
    ...config.columns.map(
      (column): ColumnDef<ReferencialRecord, unknown> => ({
        id: column.sortField ?? column.id,
        accessorFn: column.value,
        header: column.header,
        enableSorting: !!column.sortField,
        cell: ({ getValue }) => <span className={column.muted ? "text-base-content/60" : undefined}>{getValue() as string}</span>,
      }),
    ),
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Link href={ROUTES.edit_referencial_path(recurso, row.original.id)} className="btn btn-ghost btn-xs">
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
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <PageTitle>{config.title}</PageTitle>
          <p className="mt-1 text-sm text-base-content/60">{config.description}</p>
        </div>
        <Link href={ROUTES.new_referencial_path(recurso)} className="btn btn-primary btn-sm">
          {getReferencialNewLabel(config)}
        </Link>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <SearchInput valor={busca} onChange={handleBusca} placeholder={config.searchPlaceholder} />
        {config.filters?.map((filter) => (
          <FilterSelect
            key={filter.name}
            label={filter.label}
            valor={filtros[filter.name] ?? ""}
            opcoes={optionsBySource[filter.source] ?? []}
            onChange={(valor) => handleFiltro(filter.name, valor)}
          />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage={getReferencialEmptyMessage(config)}
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
