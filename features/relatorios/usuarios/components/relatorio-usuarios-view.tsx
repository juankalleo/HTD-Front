"use client";

import { useState } from "react";
import Link from "next/link";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { ROUTES, withQuery } from "@/lib/routes";
import { DataTable, FilterSelect, PageTitle, Pagination, ResultsCount, SearchInput } from "@/shared/ui";
import { Download, FileSpreadsheet } from "@/theme/icons";
import { useUsuarios } from "@/features/admin/usuarios/hooks/use-usuarios";
import { useTiposUsuario } from "@/features/admin/tipos-usuario/hooks/use-tipos-usuario";
import type { Usuario } from "@/features/admin/usuarios/types";
import { useRelatorioUsuariosKpis } from "../hooks/use-relatorio-usuarios-kpis";
import { RelatorioUsuariosCharts } from "./relatorio-usuarios-charts";
import { RelatorioUsuariosKpisSection } from "./relatorio-usuarios-kpis";

const columns: ColumnDef<Usuario, unknown>[] = [
  { id: "nome", accessorKey: "nome", header: "Nome" },
  {
    id: "tipo",
    header: "Tipo",
    enableSorting: false,
    cell: ({ row }) => row.original.a_tipo_usuario?.descricao ?? "—",
  },
];

export function RelatorioUsuariosView() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [tipoUsuarioId, setTipoUsuarioId] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading } = useUsuarios(page, busca, tipoUsuarioId, sorting);
  const { data: tipos } = useTiposUsuario();
  const { kpis, isLoading: isLoadingKpis } = useRelatorioUsuariosKpis();

  function handleBusca(valor: string) {
    setBusca(valor);
    setPage(1);
  }

  function handleFiltroTipo(valor: string) {
    setTipoUsuarioId(valor);
    setPage(1);
  }

  const filtros = { busca, tipo: tipoUsuarioId };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <PageTitle>Relatório de usuários</PageTitle>
          <p className="mt-1 text-sm text-base-content/60">Nome e tipo de cada usuário — os únicos campos que a API expõe pra admin.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={withQuery(ROUTES.relatorios_usuarios_pdf_preview_path, filtros)} className="btn btn-primary btn-sm">
            <Download className="size-4" />
            Exportar PDF
          </Link>
          <Link href={withQuery(ROUTES.relatorios_usuarios_excel_preview_path, filtros)} className="btn btn-outline btn-primary btn-sm">
            <FileSpreadsheet className="size-4" />
            Exportar Excel
          </Link>
        </div>
      </div>

      <RelatorioUsuariosKpisSection kpis={kpis} isLoading={isLoadingKpis} />

      <RelatorioUsuariosCharts kpis={kpis} isLoading={isLoadingKpis} />

      <div className="flex flex-wrap items-center gap-3">
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
        onSortingChange={setSorting}
      />

      {data && (
        <div className="flex items-center justify-between">
          <ResultsCount pagy={data.pagy} />
        </div>
      )}
      {data && <Pagination page={page} totalPages={data.pagy.total_pages} onPageChange={setPage} />}
    </div>
  );
}
