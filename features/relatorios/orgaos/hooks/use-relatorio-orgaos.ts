"use client";

import { useMemo } from "react";
import type { SortingState } from "@tanstack/react-table";
import { sortingParaRansack } from "@/lib/ransack";
import { useAdminList } from "@/shared/hooks/use-admin-resource";
import type { ReferencialRecord } from "@/features/admin/referenciais/types";
import { contarPorGrupo, formatarNumero, texto } from "@/features/relatorios/shared/relatorio-utils";
import type { RelatorioOrgaosResumo } from "../types";

export function useRelatorioOrgaos({
  page,
  busca,
  tenantId,
  sorting,
}: {
  page: number;
  busca: string;
  tenantId: string;
  sorting: SortingState;
}) {
  const ordenacao = sortingParaRansack(sorting);
  const listQuery = useAdminList<ReferencialRecord>(
    "a_orgaos",
    {
      page,
      ...(busca ? { "q[nome_cont]": busca } : {}),
      ...(tenantId ? { "q[a_tenant_id_eq]": tenantId } : {}),
      ...(ordenacao ? { "q[s]": ordenacao } : {}),
    },
    ["relatorios", "orgaos", "list", page, busca, tenantId, ordenacao ?? ""],
  );

  const orgaosQuery = useAdminList<ReferencialRecord>(
    "a_orgaos",
    { per_page: 1000, "q[s]": "nome asc" },
    ["relatorios", "orgaos", "base", "orgaos"],
  );
  const tenantsQuery = useAdminList<ReferencialRecord>(
    "a_tenants",
    { per_page: 1000, "q[s]": "nome asc" },
    ["relatorios", "orgaos", "base", "tenants"],
  );
  const unidadesQuery = useAdminList<ReferencialRecord>(
    "a_unidades",
    { per_page: 1000, "q[s]": "nome asc" },
    ["relatorios", "orgaos", "base", "unidades"],
  );

  const resumo = useMemo<RelatorioOrgaosResumo | undefined>(() => {
    if (!orgaosQuery.data || !tenantsQuery.data || !unidadesQuery.data) return undefined;

    const orgaos = orgaosQuery.data.items;
    const tenants = tenantsQuery.data.items;
    const unidades = unidadesQuery.data.items;
    const tenantNomePorId = new Map(tenants.map((tenant) => [tenant.id, texto(tenant.nome)]));
    const orgaoTenantPorId = new Map(orgaos.map((orgao) => [orgao.id, orgao.a_tenant?.id]));
    const unidadesPorOrgao = unidades.reduce<Record<number, number>>((acc, unidade) => {
      const orgaoId = unidade.a_orgao?.id;
      if (orgaoId) acc[orgaoId] = (acc[orgaoId] ?? 0) + 1;
      return acc;
    }, {});

    const orgaosPorTenant = contarPorGrupo(
      orgaos,
      (orgao) => ({ id: orgao.a_tenant?.id, label: orgao.a_tenant?.nome }),
      "Sem tenant",
    );
    const unidadesPorTenant = unidades.reduce<Record<string, number>>((acc, unidade) => {
      const tenantIdUnidade = unidade.a_orgao?.a_tenant?.id ?? orgaoTenantPorId.get(unidade.a_orgao?.id ?? 0);
      if (!tenantIdUnidade) return acc;
      const key = String(tenantIdUnidade);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const porTenant = orgaosPorTenant.map((grupo) => ({
      ...grupo,
      label: tenantNomePorId.get(Number(grupo.id)) ?? grupo.label,
      unidades: unidadesPorTenant[grupo.id] ?? 0,
    }));

    const totalTenants = tenantsQuery.data.pagy.total_count;
    const media = totalTenants > 0 ? orgaosQuery.data.pagy.total_count / totalTenants : 0;

    return {
      kpis: {
        totalOrgaos: orgaosQuery.data.pagy.total_count,
        totalTenants,
        mediaPorTenant: media.toLocaleString("pt-BR", { maximumFractionDigits: 1 }),
        totalUnidades: unidadesQuery.data.pagy.total_count,
      },
      porTenant,
      unidadesPorOrgao,
    };
  }, [orgaosQuery.data, tenantsQuery.data, unidadesQuery.data]);

  return {
    listQuery,
    resumo,
    tenantOptions: tenantsQuery.data?.items.map((tenant) => ({ valor: String(tenant.id), label: texto(tenant.nome) })) ?? [],
    isLoadingResumo: orgaosQuery.isLoading || tenantsQuery.isLoading || unidadesQuery.isLoading,
    totalLinhasExportacao: formatarNumero(orgaosQuery.data?.pagy.total_count ?? 0),
  };
}
