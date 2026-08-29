"use client";

import { useAdminDelete } from "@/shared/hooks/use-admin-resource";
import { papeisKeys } from "../constants/query-keys";

export function useDeletePapel() {
  return useAdminDelete("a_papeis", [papeisKeys.all], "Papel");
}
