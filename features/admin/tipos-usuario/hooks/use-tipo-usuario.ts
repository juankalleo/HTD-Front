"use client";

import { useAdminGet } from "@/shared/hooks/use-admin-resource";
import { tiposUsuarioKeys } from "../constants/query-keys";
import type { ATipoUsuario } from "../types";

export function useTipoUsuario(id: number) {
  return useAdminGet<ATipoUsuario>("a_tipos_usuario", id, [...tiposUsuarioKeys.all, id]);
}
