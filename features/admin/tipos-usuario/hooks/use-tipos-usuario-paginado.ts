"use client";

import type { SortingState } from "@tanstack/react-table";
import { useAdminList } from "@/shared/hooks/use-admin-resource";
import { sortingParaRansack } from "@/lib/ransack";
import { tiposUsuarioKeys } from "../constants/query-keys";
import type { ATipoUsuario } from "../types";

/** Versão paginada + com busca, pra tela de listagem — ver `useTiposUsuario` pro caso sem paginação (dropdown). */
export function useTiposUsuarioPaginado(page = 1, busca = "", sorting: SortingState = []) {
  const ordenacao = sortingParaRansack(sorting);

  return useAdminList<ATipoUsuario>(
    "a_tipos_usuario",
    { page, ...(busca ? { "q[descricao_cont]": busca } : {}), ...(ordenacao ? { "q[s]": ordenacao } : {}) },
    tiposUsuarioKeys.listPaginado(page, busca, ordenacao ?? ""),
  );
}
