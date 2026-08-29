"use client";

import { useAdminCreate } from "@/shared/hooks/use-admin-resource";
import { usuariosKeys } from "../constants/query-keys";
import type { UsuarioFormValues } from "../schemas/usuario.schema";
import type { Usuario } from "../types";

export function useCreateUsuario() {
  const mutation = useAdminCreate<Usuario>("users", [usuariosKeys.all], "Usuário");

  function createUsuario(valores: UsuarioFormValues) {
    return mutation.mutateAsync({
      user: {
        nome: valores.nome,
        email: valores.email,
        a_tipo_usuario_id: Number(valores.aTipoUsuarioId),
        password: valores.password,
      },
    });
  }

  return { createUsuario, ...mutation };
}
