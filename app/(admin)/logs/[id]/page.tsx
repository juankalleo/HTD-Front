"use client";

import { use } from "react";
import { ROUTES } from "@/lib/routes";
import { FormScreen } from "@/shared/ui";
import { LogDetalhe } from "@/features/admin/logs/components/log-detalhe";

export default function LogDetalhePage({ params }: PageProps<"/logs/[id]">) {
  const { id } = use(params);

  return (
    <FormScreen title="Detalhe do log" backHref={ROUTES.logs_path} backLabel="Logs de auditoria">
      <LogDetalhe id={Number(id)} />
    </FormScreen>
  );
}
