export const usuariosKeys = {
  all: ["admin", "usuarios"] as const,
  list: (page: number, busca: string, tipoUsuarioId: string, ordenacao: string) =>
    [...usuariosKeys.all, "list", page, busca, tipoUsuarioId, ordenacao] as const,
};
