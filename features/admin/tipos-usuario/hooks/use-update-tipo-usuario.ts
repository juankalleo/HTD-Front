"use client";

import { useAdminUpdate } from "@/shared/hooks/use-admin-resource";
import { tiposUsuarioKeys } from "../constants/query-keys";
import type { TipoUsuarioFormValues } from "../schemas/tipo-usuario.schema";
import type { ATipoUsuario } from "../types";

export function useUpdateTipoUsuario() {
  const mutation = useAdminUpdate<ATipoUsuario>("a_tipos_usuario", [tiposUsuarioKeys.all], "Tipo de usuário");

  function updateTipoUsuario(id: number, valores: TipoUsuarioFormValues) {
    return mutation.mutateAsync({ id, body: { a_tipo_usuario: valores } });
  }

  return { updateTipoUsuario, ...mutation };
}
