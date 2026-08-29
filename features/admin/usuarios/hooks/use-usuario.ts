"use client";

import { useAdminGet } from "@/shared/hooks/use-admin-resource";
import { usuariosKeys } from "../constants/query-keys";
import type { Usuario } from "../types";

export function useUsuario(id: number) {
  return useAdminGet<Usuario>("users", id, [...usuariosKeys.all, id]);
}
