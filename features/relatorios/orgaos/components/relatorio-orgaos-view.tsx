"use client";

import { useMemo, useState } from "react";
import type { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table";
import { DataTable, FilterSelect, PageTitle, Pagination, ResultsCount, SearchInput } from "@/shared/ui";
import { texto } from "@/features/relatorios/shared/relatorio-utils";
import type { ReferencialRecord } from "@/features/admin/referenciais/types";
import { useRelatorioOrgaos } from "../hooks/use-relatorio-orgaos";
import { RelatorioOrgaosCharts } from "./relatorio-orgaos-charts";
import { RelatorioOrgaosKpisSection } from "./relatorio-orgaos-kpis";

export function RelatorioOrgaosView() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { listQuery, resumo, tenantOptions, isLoadingResumo } = useRelatorioOrgaos({ page, busca, tenantId, sorting });

  function handleBusca(valor: string) {
    setBusca(valor);
    setPage(1);
  }

  function handleTenant(valor: string) {
    setTenantId(valor);
    setPage(1);
  }

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((atual) => (typeof updater === "function" ? updater(atual) : updater));
    setPage(1);
  };

  const columns = useMemo<ColumnDef<ReferencialRecord, unknown>[]>(
    () => [
      { id: "nome", accessorFn: (orgao) => texto(orgao.nome), header: "Órgão" },
      {
        id: "tenant",
        header: "Tenant",
        enableSorting: false,
        cell: ({ row }) => <span className="text-base-content/60">{texto(row.original.a_tenant?.nome)}</span>,
      },
      {
        id: "unidades",
        header: "Unidades",
        enableSorting: false,
        cell: ({ row }) => resumo?.unidadesPorOrgao[row.original.id] ?? 0,
      },
    ],
    [resumo?.unidadesPorOrgao],
  );

  return (
    <div className="w-full space-y-6">
      <div>
        <PageTitle>Relatório de órgãos</PageTitle>
        <p className="mt-1 text-sm text-base-content/60">Visão administrativa dos órgãos por tenant e unidades vinculadas.</p>
      </div>

      <RelatorioOrgaosKpisSection resumo={resumo} isLoading={isLoadingResumo} />
      <RelatorioOrgaosCharts resumo={resumo} isLoading={isLoadingResumo} />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput valor={busca} onChange={handleBusca} placeholder="Buscar por órgão..." />
        <FilterSelect label="Tenant" valor={tenantId} opcoes={tenantOptions} onChange={handleTenant} />
      </div>

      <DataTable
        columns={columns}
        data={listQuery.data?.items ?? []}
        isLoading={listQuery.isLoading}
        emptyMessage="Nenhum órgão encontrado."
        sorting={sorting}
        onSortingChange={handleSortingChange}
      />

      {listQuery.data && (
        <div className="flex items-center justify-between">
          <ResultsCount pagy={listQuery.data.pagy} />
        </div>
      )}
      {listQuery.data && <Pagination page={page} totalPages={listQuery.data.pagy.total_pages} onPageChange={setPage} />}
    </div>
  );
}
