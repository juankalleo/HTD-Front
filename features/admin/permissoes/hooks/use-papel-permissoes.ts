"use client";

import { useAdminList } from "@/shared/hooks/use-admin-resource";
import { papelPermissoesKeys } from "../constants/query-keys";
import type { APapelPermissao } from "../types";

/**
 * Permissões que um papel específico já tem. Filtro via Ransack
 * (`q[a_papel_id_eq]`, não um param solto — ver
 * api/app/services/a_papel_permissao/list.rb).
 */
export function usePapelPermissoes(papelId: number) {
  return useAdminList<APapelPermissao>(
    "a_papeis_permissoes",
    { per_page: 500, "q[a_papel_id_eq]": papelId },
    papelPermissoesKeys.porPapel(papelId),
  );
}
