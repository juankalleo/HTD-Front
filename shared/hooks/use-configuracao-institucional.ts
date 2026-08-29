"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchConfiguracaoInstitucional } from "@/services/api-institucional";

export const configInstitucionalKeys = { atual: ["config-institucional", "atual"] as const };

/**
 * Mesma rota pública que o layout raiz usa no servidor (GET
 * /api/v1/c_configuracoes/atual) — versão client-side, pra qualquer
 * componente que precise reagir a ela (sidebar mostrando o nome do sistema,
 * formulários de Aparência/Identidade em features/admin/config-institucional).
 */
export function useConfiguracaoInstitucional() {
  return useQuery({
    queryKey: configInstitucionalKeys.atual,
    queryFn: fetchConfiguracaoInstitucional,
  });
}
