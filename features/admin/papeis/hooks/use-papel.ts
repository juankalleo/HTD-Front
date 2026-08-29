"use client";

import { useAdminGet } from "@/shared/hooks/use-admin-resource";
import { papeisKeys } from "../constants/query-keys";
import type { APapel } from "../types";

export function usePapel(id: number) {
  return useAdminGet<APapel>("a_papeis", id, [...papeisKeys.all, id]);
}
