export const papeisKeys = {
  all: ["admin", "papeis"] as const,
  list: (page: number, busca: string, ordenacao: string) => [...papeisKeys.all, "list", page, busca, ordenacao] as const,
};
