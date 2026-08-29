export const tiposUsuarioKeys = {
  all: ["admin", "tipos-usuario"] as const,
  // Sem paginação — usado só pro dropdown de tipo em usuario-form.tsx, que
  // precisa das opções inteiras, não de uma página.
  list: () => [...tiposUsuarioKeys.all, "list"] as const,
  // Paginada + com busca — usada pela tela de listagem (tipos-usuario-list.tsx).
  listPaginado: (page: number, busca: string, ordenacao: string) =>
    [...tiposUsuarioKeys.all, "list-paginado", page, busca, ordenacao] as const,
};
