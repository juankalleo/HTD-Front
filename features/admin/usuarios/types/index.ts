import type { ATipoUsuario } from "@/features/admin/tipos-usuario/types";

export type { ATipoUsuario };

/**
 * Espelha UserSerializer (api/app/serializers/user_serializer.rb): só
 * `id`, `nome`, `a_tipo_usuario` — o backend não devolve `email` em
 * nenhuma resposta de admin (só no login/sessão, via CurrentUserSerializer).
 * Formulário de edição aceita `email` no envio, mas não tem como pré-popular
 * o campo com o e-mail atual — isso é limite real do backend, não bug daqui.
 */
export type Usuario = {
  id: number;
  nome: string;
  a_tipo_usuario?: ATipoUsuario;
};
