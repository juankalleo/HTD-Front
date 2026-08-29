"use client";

import { useAdminCreate } from "@/shared/hooks/use-admin-resource";
import { papeisKeys } from "../constants/query-keys";
import type { PapelFormValues } from "../schemas/papel.schema";
import type { APapel } from "../types";

export function useCreatePapel() {
  const mutation = useAdminCreate<APapel>("a_papeis", [papeisKeys.all], "Papel");

  function createPapel(valores: PapelFormValues) {
    return mutation.mutateAsync({ a_papel: valores });
  }

  return { createPapel, ...mutation };
}
