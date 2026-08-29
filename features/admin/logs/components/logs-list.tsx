"use client";

import { useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ROUTES } from "@/lib/routes";
import { DataTable, FilterSelect, PageTitle, Pagination, ResultsCount, SearchInput } from "@/shared/ui";
import { useLogs } from "../hooks/use-logs";
import type { LogAuditoria } from "../types";

const EVENTOS = [
  { valor: "create", label: "Criação" },
  { valor: "update", label: "Alteração" },
  { valor: "destroy", label: "Exclusão" },
];

/**
 * Sem ordenação por coluna de propósito: a API (`VersionLog::List`) sempre
 * devolve por `created_at desc` — não tem parâmetro de sort (`PaperTrail::
 * Version` não usa Ransack, ver `use-logs.ts`).
 */
export function LogsList() {
  const [page, setPage] = useState(1);
  const [itemType, setItemType] = useState("");
  const [event, setEvent] = useState("");
  const { data, isLoading } = useLogs(page, itemType, event);

  function handleItemType(valor: string) {
    setItemType(valor);
    setPage(1);
  }

  function handleEvent(valor: string) {
    setEvent(valor);
    setPage(1);
  }

  const columns: ColumnDef<LogAuditoria, unknown>[] = [
    { id: "created_at", accessorKey: "created_at", header: "Quando", enableSorting: false, cell: ({ row }) => new Date(row.original.created_at).toLocaleString("pt-BR") },
    { id: "item_type", accessorKey: "item_type", header: "Registro", enableSorting: false },
    { id: "item_id", accessorKey: "item_id", header: "ID", enableSorting: false },
    {
      id: "event",
      header: "Ação",
      enableSorting: false,
      cell: ({ row }) => EVENTOS.find((evento) => evento.valor === row.original.event)?.label ?? row.original.event,
    },
    { id: "usuario", header: "Quem", enableSorting: false, cell: ({ row }) => row.original.usuario ?? "—" },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Link href={ROUTES.log_path(row.original.id)} className="btn btn-ghost btn-xs">
            Ver detalhe
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-4">
        <PageTitle>Logs de auditoria</PageTitle>
        <p className="mt-1 text-sm text-base-content/60">
          Rastro automático de criação, alteração e exclusão de registro (PaperTrail) — só leitura.
        </p>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <SearchInput valor={itemType} onChange={handleItemType} placeholder="Tipo de registro (nome exato, ex.: AOrgao)..." />
        <FilterSelect label="Ação" valor={event} opcoes={EVENTOS} onChange={handleEvent} />
      </div>

      <DataTable columns={columns} data={data?.items ?? []} isLoading={isLoading} emptyMessage="Nenhum log encontrado." />

      {data && (
        <div className="mt-2 flex items-center justify-between">
          <ResultsCount pagy={data.pagy} />
        </div>
      )}
      {data && <Pagination page={page} totalPages={data.pagy.total_pages} onPageChange={setPage} />}
    </div>
  );
}
