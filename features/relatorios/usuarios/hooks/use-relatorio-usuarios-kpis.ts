"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { adminList } from "@/services/api-admin";
import { useTiposUsuario } from "@/features/admin/tipos-usuario/hooks/use-tipos-usuario";
import type { Usuario } from "@/features/admin/usuarios/types";
import type { RelatorioUsuariosKpis } from "../types";

/**
 * KPIs do relatório: total de usuários + contagem por tipo. `per_page: 1`
 * de propósito — só interessa `pagy.total_count` (a contagem real do filtro
 * inteiro, independente de quantas linhas vêm na página), então pede o
 * mínimo de dado possível. N+1 (uma request por tipo) é aceitável aqui: o
 * número de tipos de usuário é sempre pequeno (vocabulário fixo/curto, não
 * uma tabela que cresce sem limite).
 */
export function useRelatorioUsuariosKpis() {
  const { data: tipos } = useTiposUsuario();

  const totalQuery = useQuery({
    queryKey: ["relatorios", "usuarios", "kpi-total"],
    queryFn: () => adminList<Usuario>("users", { per_page: 1 }),
  });

  const porTipoQueries = useQueries({
    queries: (tipos?.items ?? []).map((tipo) => ({
      queryKey: ["relatorios", "usuarios", "kpi-por-tipo", tipo.id],
      queryFn: () => adminList<Usuario>("users", { per_page: 1, "q[a_tipo_usuario_id_eq]": tipo.id }),
    })),
  });

  const isLoading = !tipos || totalQuery.isLoading || porTipoQueries.some((q) => q.isLoading);

  const kpis: RelatorioUsuariosKpis | undefined = !isLoading
    ? {
        total: totalQuery.data?.pagy.total_count ?? 0,
        porTipo: tipos.items.map((tipo, index) => ({
          tipoId: tipo.id,
          descricao: tipo.descricao,
          total: porTipoQueries[index]?.data?.pagy.total_count ?? 0,
        })),
      }
    : undefined;

  return { kpis, isLoading };
}
