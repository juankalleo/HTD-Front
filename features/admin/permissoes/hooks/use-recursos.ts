"use client";

import { useAdminList } from "@/shared/hooks/use-admin-resource";
import { recursosKeys } from "../constants/query-keys";
import type { ARecurso } from "../types";

/**
 * Só leitura, de propósito — `a_recursos` precisa ser o nome exato da classe
 * Ruby do backend (resolvido via `safe_constantize` em `ability.rb`), então
 * cadastro/edição fica só pelo console/seed da API, nunca pelo front (ver
 * `db/seeds.rb` e `docs/MOTOR.md` no repo `api/`).
 */
export function useRecursos() {
  return useAdminList<ARecurso>("a_recursos", { per_page: 100 }, recursosKeys.list());
}
