"use client";

import { useMemo, useState } from "react";
import type { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table";
import { DataTable, FilterSelect, PageTitle, Pagination, ResultsCount, SearchInput } from "@/shared/ui";
import { texto } from "@/features/relatorios/shared/relatorio-utils";
import type { ReferencialRecord } from "@/features/admin/referenciais/types";
import { useRelatorioUnidades } from "../hooks/use-relatorio-unidades";
import { RelatorioUnidadesCharts } from "./relatorio-unidades-charts";
import { RelatorioUnidadesKpisSection } from "./relatorio-unidades-kpis";

export function RelatorioUnidadesView() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [orgaoId, setOrgaoId] = useState("");
  const [tipoUnidadeId, setTipoUnidadeId] = useState("");
  const [municipioId, setMunicipioId] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { listQuery, resumo, orgaoOptions, tipoOptions, municipioOptions, isLoadingResumo } = useRelatorioUnidades({
    page,
    busca,
    orgaoId,
    tipoUnidadeId,
    municipioId,
    sorting,
  });

  function handleBusca(valor: string) {
    setBusca(valor);
    setPage(1);
  }

  function handleOrgao(valor: string) {
    setOrgaoId(valor);
    setPage(1);
  }

  function handleTipo(valor: string) {
    setTipoUnidadeId(valor);
    setPage(1);
  }

  function handleMunicipio(valor: string) {
    setMunicipioId(valor);
    setPage(1);
  }

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((atual) => (typeof updater === "function" ? updater(atual) : updater));
    setPage(1);
  };

  const columns = useMemo<ColumnDef<ReferencialRecord, unknown>[]>(
    () => [
      { id: "nome", accessorFn: (unidade) => texto(unidade.nome), header: "Unidade" },
      {
        id: "orgao",
        header: "Órgão",
        enableSorting: false,
        cell: ({ row }) => <span className="text-base-content/60">{texto(row.original.a_orgao?.nome)}</span>,
      },
      {
        id: "tipo",
        header: "Tipo",
        enableSorting: false,
        cell: ({ row }) => <span className="text-base-content/60">{texto(row.original.a_tipo_unidade?.descricao)}</span>,
      },
      {
        id: "municipio",
        header: "Município",
        enableSorting: false,
        cell: ({ row }) => {
          const municipio = row.original.g_municipio;
          return (
            <span className="text-base-content/60">
              {municipio?.g_estado?.uf ? `${texto(municipio.descricao)}/${municipio.g_estado.uf}` : texto(municipio?.descricao)}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="w-full space-y-6">
      <div>
        <PageTitle>Relatório de unidades</PageTitle>
        <p className="mt-1 text-sm text-base-content/60">Distribuição das unidades por órgão, tipo e município.</p>
      </div>

      <RelatorioUnidadesKpisSection resumo={resumo} isLoading={isLoadingResumo} />
      <RelatorioUnidadesCharts resumo={resumo} isLoading={isLoadingResumo} />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput valor={busca} onChange={handleBusca} placeholder="Buscar por unidade..." />
        <FilterSelect label="Órgão" valor={orgaoId} opcoes={orgaoOptions} onChange={handleOrgao} />
        <FilterSelect label="Tipo" valor={tipoUnidadeId} opcoes={tipoOptions} onChange={handleTipo} />
        <FilterSelect label="Município" valor={municipioId} opcoes={municipioOptions} onChange={handleMunicipio} />
      </div>

      <DataTable
        columns={columns}
        data={listQuery.data?.items ?? []}
        isLoading={listQuery.isLoading}
        emptyMessage="Nenhuma unidade encontrada."
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
