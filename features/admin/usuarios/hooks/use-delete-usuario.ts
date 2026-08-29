"use client";

import { useAdminDelete } from "@/shared/hooks/use-admin-resource";
import { usuariosKeys } from "../constants/query-keys";

export function useDeleteUsuario() {
  return useAdminDelete("users", [usuariosKeys.all], "Usuário");
}
