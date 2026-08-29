"use client";

import type { SortingState } from "@tanstack/react-table";
import { useAdminList } from "@/shared/hooks/use-admin-resource";
import { sortingParaRansack } from "@/lib/ransack";
import { papeisKeys } from "../constants/query-keys";
import type { APapel } from "../types";

export function usePapeis(page = 1, busca = "", sorting: SortingState = []) {
  const ordenacao = sortingParaRansack(sorting);

  return useAdminList<APapel>(
    "a_papeis",
    { page, ...(busca ? { "q[nome_or_descricao_cont]": busca } : {}), ...(ordenacao ? { "q[s]": ordenacao } : {}) },
    papeisKeys.list(page, busca, ordenacao ?? ""),
  );
}
