"use client";

import { useQueries } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";
import { sortingParaRansack } from "@/lib/ransack";
import { adminList } from "@/services/api-admin";
import { useAdminCreate, useAdminDelete, useAdminGet, useAdminList, useAdminUpdate } from "@/shared/hooks/use-admin-resource";
import {
  buildReferencialBody,
  getReferencialOptionLabel,
  REFERENCIAIS,
  type ReferencialConfig,
} from "../config";
import { referenciaisKeys } from "../constants/query-keys";
import type { ReferencialFormValues, ReferencialKey, ReferencialOption, ReferencialRecord } from "../types";

function filtroKey(filtros: Record<string, string>) {
  return Object.entries(filtros)
    .filter(([, value]) => value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
}

function listParams(config: ReferencialConfig, page: number, busca: string, filtros: Record<string, string>, sorting: SortingState) {
  const ordenacao = sortingParaRansack(sorting);
  const params: Record<string, string | number | undefined> = {
    page,
    ...(busca ? { [config.searchParam]: busca } : {}),
    ...(ordenacao ? { "q[s]": ordenacao } : {}),
  };

  for (const filter of config.filters ?? []) {
    const value = filtros[filter.name];
    if (value) params[filter.queryParam] = value;
  }

  return { params, ordenacao };
}

export function useReferencialList(recurso: ReferencialKey, page: number, busca: string, filtros: Record<string, string>, sorting: SortingState) {
  const config = REFERENCIAIS[recurso];
  const { params, ordenacao } = listParams(config, page, busca, filtros, sorting);

  return useAdminList<ReferencialRecord>(config.resource, params, referenciaisKeys.list(recurso, page, busca, filtroKey(filtros), ordenacao ?? ""));
}

export function useReferencialRecord(recurso: ReferencialKey, id: number | string) {
  const config = REFERENCIAIS[recurso];
  return useAdminGet<ReferencialRecord>(config.resource, id, referenciaisKeys.detail(recurso, id));
}

export function useCreateReferencial(recurso: ReferencialKey) {
  const config = REFERENCIAIS[recurso];
  const mutation = useAdminCreate<ReferencialRecord>(config.resource, [referenciaisKeys.all], config.singular);

  function createReferencial(values: ReferencialFormValues) {
    return mutation.mutateAsync(buildReferencialBody(config, values));
  }

  return { createReferencial, ...mutation };
}

export function useUpdateReferencial(recurso: ReferencialKey) {
  const config = REFERENCIAIS[recurso];
  const mutation = useAdminUpdate<ReferencialRecord>(config.resource, [referenciaisKeys.all], config.singular);

  function updateReferencial(id: number | string, values: ReferencialFormValues) {
    return mutation.mutateAsync({ id, body: buildReferencialBody(config, values) });
  }

  return { updateReferencial, ...mutation };
}

export function useDeleteReferencial(recurso: ReferencialKey) {
  const config = REFERENCIAIS[recurso];
  return useAdminDelete(config.resource, [referenciaisKeys.all], config.singular);
}

export function useReferencialOptionsMap(sources: ReferencialKey[]) {
  const uniqueSources = [...new Set(sources)];
  const queries = useQueries({
    queries: uniqueSources.map((source) => {
      const config = REFERENCIAIS[source];
      return {
        queryKey: referenciaisKeys.options(source),
        queryFn: () => adminList<ReferencialRecord>(config.resource, { per_page: 500, "q[s]": config.optionSort }),
        staleTime: 5 * 60 * 1000,
      };
    }),
  });

  const optionsBySource = uniqueSources.reduce<Record<ReferencialKey, ReferencialOption[]>>((acc, source, index) => {
    const records = queries[index].data?.items ?? [];
    acc[source] = records.map((record) => ({
      valor: String(record.id),
      label: getReferencialOptionLabel(source, record),
    }));
    return acc;
  }, {} as Record<ReferencialKey, ReferencialOption[]>);

  return {
    optionsBySource,
    isLoading: queries.some((query) => query.isLoading),
  };
}
