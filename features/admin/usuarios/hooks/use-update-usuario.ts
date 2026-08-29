"use client";

import { useAdminUpdate } from "@/shared/hooks/use-admin-resource";
import { usuariosKeys } from "../constants/query-keys";
import type { UsuarioFormValues } from "../schemas/usuario.schema";
import type { Usuario } from "../types";

export function useUpdateUsuario() {
  const mutation = useAdminUpdate<Usuario>("users", [usuariosKeys.all], "Usuário");

  function updateUsuario(id: number, valores: UsuarioFormValues) {
    return mutation.mutateAsync({
      id,
      body: {
        user: {
          nome: valores.nome,
          email: valores.email,
          a_tipo_usuario_id: Number(valores.aTipoUsuarioId),
          // Senha em branco = não trocar (nunca manda o campo nesse caso).
          ...(valores.password ? { password: valores.password } : {}),
        },
      },
    });
  }

  return { updateUsuario, ...mutation };
}
