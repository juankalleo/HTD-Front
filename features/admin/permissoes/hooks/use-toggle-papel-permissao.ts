"use client";

import { useAdminCreate, useAdminDelete } from "@/shared/hooks/use-admin-resource";
import { papelPermissoesKeys } from "../constants/query-keys";
import type { APapelPermissao } from "../types";

export function useTogglePapelPermissao(papelId: number) {
  const invalidateKeys = [papelPermissoesKeys.porPapel(papelId)];
  const conceder = useAdminCreate<APapelPermissao>("a_papeis_permissoes", invalidateKeys, "Permissão");
  const revogar = useAdminDelete("a_papeis_permissoes", invalidateKeys, "Permissão");

  return {
    conceder: (permissaoId: number) => conceder.mutate({ a_papel_permissao: { a_papel_id: papelId, a_permissao_id: permissaoId } }),
    revogar: (papelPermissaoId: number) => revogar.mutate(papelPermissaoId),
    isPending: conceder.isPending || revogar.isPending,
  };
}
