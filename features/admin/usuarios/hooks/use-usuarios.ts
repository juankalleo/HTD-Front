"use client";

import type { SortingState } from "@tanstack/react-table";
import { useAdminList } from "@/shared/hooks/use-admin-resource";
import { sortingParaRansack } from "@/lib/ransack";
import { usuariosKeys } from "../constants/query-keys";
import type { Usuario } from "../types";

export function useUsuarios(page = 1, busca = "", tipoUsuarioId = "", sorting: SortingState = []) {
  const ordenacao = sortingParaRansack(sorting);

  return useAdminList<Usuario>(
    "users",
    {
      page,
      ...(busca ? { "q[nome_cont]": busca } : {}),
      ...(tipoUsuarioId ? { "q[a_tipo_usuario_id_eq]": tipoUsuarioId } : {}),
      ...(ordenacao ? { "q[s]": ordenacao } : {}),
    },
    usuariosKeys.list(page, busca, tipoUsuarioId, ordenacao ?? ""),
  );
}
