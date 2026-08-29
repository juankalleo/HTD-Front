"use client";

import { useAdminList } from "@/shared/hooks/use-admin-resource";
import { permissoesKeys } from "../constants/query-keys";
import type { APermissao } from "../types";

/** Todas as combinações recurso×ação que já existem como permissão cadastrada. */
export function usePermissoes() {
  return useAdminList<APermissao>("a_permissoes", { per_page: 200 }, permissoesKeys.list());
}
