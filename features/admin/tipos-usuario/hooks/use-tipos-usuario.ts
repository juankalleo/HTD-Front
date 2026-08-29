"use client";

import { useAdminList } from "@/shared/hooks/use-admin-resource";
import { tiposUsuarioKeys } from "../constants/query-keys";
import type { ATipoUsuario } from "../types";

export function useTiposUsuario() {
  return useAdminList<ATipoUsuario>("a_tipos_usuario", { per_page: 100 }, tiposUsuarioKeys.list());
}
