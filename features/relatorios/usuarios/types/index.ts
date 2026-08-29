import type { Usuario } from "@/features/admin/usuarios/types";

/**
 * Contrato do relatório de usuários — só campos reais do `User` da api/
 * (`UserSerializer`: `id, nome, a_tipo_usuario`, nunca `email`/status/perfil/
 * último acesso, que não existem no backend). Ver `docs/RELATORIOS.md`.
 */
export type RelatorioUsuarioLinha = Usuario;

export type RelatorioUsuariosKpis = {
  total: number;
  porTipo: { tipoId: number; descricao: string; total: number }[];
};
