"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { FormScreen } from "@/shared/ui";
import { getReferencialNewLabel, REFERENCIAIS } from "../config";
import type { ReferencialKey } from "../types";
import { ReferencialForm } from "./referencial-form";

export function ReferencialCreatePage({ recurso }: { recurso: ReferencialKey }) {
  const router = useRouter();
  const config = REFERENCIAIS[recurso];
  const listPath = ROUTES.referencial_recurso_path(recurso);

  return (
    <FormScreen title={getReferencialNewLabel(config)} backHref={listPath} backLabel={config.title}>
      <ReferencialForm recurso={recurso} onDone={() => router.push(listPath)} />
    </FormScreen>
  );
}
