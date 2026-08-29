export const recursosKeys = { all: ["admin", "recursos"] as const, list: () => [...recursosKeys.all, "list"] as const };
export const acoesKeys = { all: ["admin", "acoes"] as const, list: () => [...acoesKeys.all, "list"] as const };
export const permissoesKeys = { all: ["admin", "permissoes"] as const, list: () => [...permissoesKeys.all, "list"] as const };

export const papelPermissoesKeys = {
  all: ["admin", "papel-permissoes"] as const,
  porPapel: (papelId: number) => [...papelPermissoesKeys.all, papelId] as const,
};
