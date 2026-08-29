"use client";

import { useAdminList } from "@/shared/hooks/use-admin-resource";
import { acoesKeys } from "../constants/query-keys";
import type { AAcao } from "../types";

/** Vocabulário fixo (CONSULTAR/INCLUIR/ALTERAR/EXCLUIR/GERENCIAR) — só leitura. */
export function useAcoes() {
  return useAdminList<AAcao>("a_acoes", { per_page: 100 }, acoesKeys.list());
}
