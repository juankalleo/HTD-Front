"use client";

import { useMemo } from "react";
import type { SortingState } from "@tanstack/react-table";
import { sortingParaRansack } from "@/lib/ransack";
import { useAdminList } from "@/shared/hooks/use-admin-resource";
import type { ReferencialRecord } from "@/features/admin/referenciais/types";
import { contarPorGrupo, texto } from "@/features/relatorios/shared/relatorio-utils";
import type { RelatorioUnidadesResumo } from "../types";

export function useRelatorioUnidades({
  page,
  busca,
  orgaoId,
  tipoUnidadeId,
  municipioId,
  sorting,
}: {
  page: number;
  busca: string;
  orgaoId: string;
  tipoUnidadeId: string;
  municipioId: string;
  sorting: SortingState;
}) {
  const ordenacao = sortingParaRansack(sorting);
  const listQuery = useAdminList<ReferencialRecord>(
    "a_unidades",
    {
      page,
      ...(busca ? { "q[nome_cont]": busca } : {}),
      ...(orgaoId ? { "q[a_orgao_id_eq]": orgaoId } : {}),
      ...(tipoUnidadeId ? { "q[a_tipo_unidade_id_eq]": tipoUnidadeId } : {}),
      ...(municipioId ? { "q[g_municipio_id_eq]": municipioId } : {}),
      ...(ordenacao ? { "q[s]": ordenacao } : {}),
    },
    ["relatorios", "unidades", "list", page, busca, orgaoId, tipoUnidadeId, municipioId, ordenacao ?? ""],
  );

  const unidadesQuery = useAdminList<ReferencialRecord>(
    "a_unidades",
    { per_page: 1000, "q[s]": "nome asc" },
    ["relatorios", "unidades", "base", "unidades"],
  );
  const orgaosQuery = useAdminList<ReferencialRecord>(
    "a_orgaos",
    { per_page: 1000, "q[s]": "nome asc" },
    ["relatorios", "unidades", "base", "orgaos"],
  );
  const tiposQuery = useAdminList<ReferencialRecord>(
    "a_tipos_unidade",
    { per_page: 1000, "q[s]": "descricao asc" },
    ["relatorios", "unidades", "base", "tipos"],
  );
  const municipiosQuery = useAdminList<ReferencialRecord>(
    "g_municipios",
    { per_page: 1000, "q[s]": "descricao asc" },
    ["relatorios", "unidades", "base", "municipios"],
  );

  const resumo = useMemo<RelatorioUnidadesResumo | undefined>(() => {
    if (!unidadesQuery.data) return undefined;

    const unidades = unidadesQuery.data.items;
    const orgaosComUnidade = new Set(unidades.map((unidade) => unidade.a_orgao?.id).filter(Boolean)).size;
    const tiposUsados = new Set(unidades.map((unidade) => unidade.a_tipo_unidade?.id).filter(Boolean)).size;
    const municipiosAtendidos = new Set(unidades.map((unidade) => unidade.g_municipio?.id).filter(Boolean)).size;

    const porTipoBase = contarPorGrupo(
      unidades,
      (unidade) => ({ id: unidade.a_tipo_unidade?.id, label: unidade.a_tipo_unidade?.descricao }),
      "Sem tipo",
    );
    const orgaosPorTipo = unidades.reduce<Record<string, Set<number>>>((acc, unidade) => {
      const key = unidade.a_tipo_unidade?.id ? String(unidade.a_tipo_unidade.id) : "__sem_vinculo__";
      const orgaoIdUnidade = unidade.a_orgao?.id;
      acc[key] ??= new Set<number>();
      if (orgaoIdUnidade) acc[key].add(orgaoIdUnidade);
      return acc;
    }, {});

    return {
      kpis: {
        totalUnidades: unidadesQuery.data.pagy.total_count,
        orgaosComUnidade,
        tiposUsados,
        municipiosAtendidos,
      },
      porTipo: porTipoBase.map((grupo) => ({
        ...grupo,
        orgaos: orgaosPorTipo[grupo.id]?.size ?? 0,
      })),
      porMunicipio: contarPorGrupo(
        unidades,
        (unidade) => ({
          id: unidade.g_municipio?.id,
          label: unidade.g_municipio?.g_estado?.uf
            ? `${texto(unidade.g_municipio?.descricao)}/${unidade.g_municipio.g_estado.uf}`
            : unidade.g_municipio?.descricao,
        }),
        "Sem município",
      ),
    };
  }, [unidadesQuery.data]);

  return {
    listQuery,
    resumo,
    orgaoOptions: orgaosQuery.data?.items.map((orgao) => ({ valor: String(orgao.id), label: texto(orgao.nome) })) ?? [],
    tipoOptions: tiposQuery.data?.items.map((tipo) => ({ valor: String(tipo.id), label: texto(tipo.descricao) })) ?? [],
    municipioOptions:
      municipiosQuery.data?.items.map((municipio) => ({
        valor: String(municipio.id),
        label: municipio.g_estado?.uf ? `${texto(municipio.descricao)}/${municipio.g_estado.uf}` : texto(municipio.descricao),
      })) ?? [],
    isLoadingResumo: unidadesQuery.isLoading || orgaosQuery.isLoading || tiposQuery.isLoading || municipiosQuery.isLoading,
  };
}
