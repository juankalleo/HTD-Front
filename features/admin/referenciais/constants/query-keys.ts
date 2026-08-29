import type { ReferencialKey } from "../types";

export const referenciaisKeys = {
  all: ["admin", "referenciais"] as const,
  recurso: (recurso: ReferencialKey) => [...referenciaisKeys.all, recurso] as const,
  list: (recurso: ReferencialKey, page: number, busca: string, filtros: string, ordenacao: string) =>
    [...referenciaisKeys.recurso(recurso), "list", page, busca, filtros, ordenacao] as const,
  detail: (recurso: ReferencialKey, id: number | string) => [...referenciaisKeys.recurso(recurso), "detail", id] as const,
  options: (recurso: ReferencialKey) => [...referenciaisKeys.recurso(recurso), "options"] as const,
};
