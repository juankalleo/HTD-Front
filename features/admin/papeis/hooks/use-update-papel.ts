"use client";

import { useAdminUpdate } from "@/shared/hooks/use-admin-resource";
import { papeisKeys } from "../constants/query-keys";
import type { PapelFormValues } from "../schemas/papel.schema";
import type { APapel } from "../types";

export function useUpdatePapel() {
  const mutation = useAdminUpdate<APapel>("a_papeis", [papeisKeys.all], "Papel");

  function updatePapel(id: number, valores: PapelFormValues) {
    return mutation.mutateAsync({ id, body: { a_papel: valores } });
  }

  return { updatePapel, ...mutation };
}
