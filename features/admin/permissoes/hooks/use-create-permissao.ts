"use client";

import { useAdminCreate } from "@/shared/hooks/use-admin-resource";
import { permissoesKeys } from "../constants/query-keys";
import type { APermissao } from "../types";

/**
 * Cria a `a_permissao` (recurso×ação) quando ela ainda não existe — usado
 * pela matriz pra permitir marcar uma combinação nova sem precisar de uma
 * tela separada de cadastro. `descricao` é obrigatória no model
 * (api/app/models/a_permissao.rb: `validates :descricao, presence: true`) —
 * gerada aqui a partir dos nomes de recurso/ação, nunca mandada em branco.
 */
export function useCreatePermissao() {
  const mutation = useAdminCreate<APermissao>("a_permissoes", [permissoesKeys.all], "Permissão");

  function createPermissao(recursoId: number, acaoId: number, descricao: string) {
    return mutation.mutateAsync({ a_permissao: { a_recurso_id: recursoId, a_acao_id: acaoId, descricao } });
  }

  return { createPermissao, ...mutation };
}
