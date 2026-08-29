"use client";

import { useAdminDelete } from "@/shared/hooks/use-admin-resource";
import { tiposUsuarioKeys } from "../constants/query-keys";

export function useDeleteTipoUsuario() {
  return useAdminDelete("a_tipos_usuario", [tiposUsuarioKeys.all], "Tipo de usuário");
}
