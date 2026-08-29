"use client";

import { useAdminCreate } from "@/shared/hooks/use-admin-resource";
import { tiposUsuarioKeys } from "../constants/query-keys";
import type { TipoUsuarioFormValues } from "../schemas/tipo-usuario.schema";
import type { ATipoUsuario } from "../types";

export function useCreateTipoUsuario() {
  const mutation = useAdminCreate<ATipoUsuario>("a_tipos_usuario", [tiposUsuarioKeys.all], "Tipo de usuário");

  function createTipoUsuario(valores: TipoUsuarioFormValues) {
    return mutation.mutateAsync({ a_tipo_usuario: valores });
  }

  return { createTipoUsuario, ...mutation };
}
