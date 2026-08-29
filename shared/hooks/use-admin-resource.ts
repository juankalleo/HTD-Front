"use client";

import { useQuery, useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { Toast } from "@/shared/ui";
import { adminList, adminGet, adminCreate, adminUpdate, adminDelete, AdminApiError, type PagedResult } from "@/services/api-admin";

/**
 * Hooks genéricos pra qualquer recurso `/api/v1/admin/<resource>` — todos
 * seguem o mesmo formato porque nascem do gerador Rails (`bin/rails g
 * api_scaffold`, ver api/CLAUDE.md). Cada feature de admin monta o hook de
 * domínio (ex.: `usePapeis`) chamando estes, sem duplicar fetch/paginação.
 */
export function useAdminList<T>(
  resource: string,
  params: { page?: number; per_page?: number } & Record<string, string | number | boolean | undefined> = {},
  queryKey: QueryKey,
) {
  return useQuery<PagedResult<T>>({
    queryKey: [...queryKey, resource, params],
    queryFn: () => adminList<T>(resource, params),
  });
}

export function useAdminGet<T>(resource: string, id: number | string, queryKey: QueryKey) {
  return useQuery<T>({
    queryKey: [...queryKey, resource, id],
    queryFn: () => adminGet<T>(resource, id),
  });
}

function mensagemDeErro(erro: unknown, fallback: string) {
  return erro instanceof AdminApiError ? erro.message : fallback;
}

export function useAdminCreate<T>(resource: string, invalidateKeys: QueryKey[], entidade: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => adminCreate<T>(resource, body),
    onSuccess: () => {
      void Toast.success({ title: `${entidade} criado(a)` });
      invalidateKeys.forEach((key) => qc.invalidateQueries({ queryKey: key }));
    },
    onError: (erro) => void Toast.error({ title: `Não foi possível criar`, description: mensagemDeErro(erro, "Tente novamente.") }),
  });
}

export function useAdminUpdate<T>(resource: string, invalidateKeys: QueryKey[], entidade: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: Record<string, unknown> }) => adminUpdate<T>(resource, id, body),
    onSuccess: () => {
      void Toast.success({ title: `${entidade} atualizado(a)` });
      invalidateKeys.forEach((key) => qc.invalidateQueries({ queryKey: key }));
    },
    onError: (erro) => void Toast.error({ title: `Não foi possível salvar`, description: mensagemDeErro(erro, "Tente novamente.") }),
  });
}

export function useAdminDelete(resource: string, invalidateKeys: QueryKey[], entidade: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => adminDelete(resource, id),
    onSuccess: () => {
      void Toast.success({ title: `${entidade} excluído(a)` });
      invalidateKeys.forEach((key) => qc.invalidateQueries({ queryKey: key }));
    },
    onError: (erro) => void Toast.error({ title: `Não foi possível excluir`, description: mensagemDeErro(erro, "Tente novamente.") }),
  });
}
