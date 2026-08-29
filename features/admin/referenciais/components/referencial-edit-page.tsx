"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { FormScreen } from "@/shared/ui";
import { REFERENCIAIS } from "../config";
import { useReferencialRecord } from "../hooks/use-referenciais";
import type { ReferencialKey } from "../types";
import { ReferencialForm } from "./referencial-form";

export function ReferencialEditPage({ recurso, id }: { recurso: ReferencialKey; id: string }) {
  const router = useRouter();
  const config = REFERENCIAIS[recurso];
  const listPath = ROUTES.referencial_recurso_path(recurso);
  const { data: record, isLoading } = useReferencialRecord(recurso, id);

  return (
    <FormScreen title={`Editar ${config.singular.toLowerCase()}`} backHref={listPath} backLabel={config.title}>
      {isLoading && <p className="text-sm text-base-content/60">Carregando...</p>}
      {!isLoading && record && (
        <ReferencialForm key={`${recurso}-${id}`} recurso={recurso} record={record} onDone={() => router.push(listPath)} />
      )}
    </FormScreen>
  );
}
