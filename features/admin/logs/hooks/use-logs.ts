"use client";

import { useAdminList } from "@/shared/hooks/use-admin-resource";
import { logsKeys } from "../constants/query-keys";
import type { LogAuditoria } from "../types";

/**
 * `PaperTrail::Version` não tem `ransackable_attributes` (herda de
 * `ActiveRecord::Base` direto, não de `ApplicationRecord` — ver
 * `api/app/services/version_log/list.rb`), então o filtro da API não usa a
 * convenção `q[campo_cont]` do resto do admin — os params vão direto
 * (`item_type`, `event`), sem o prefixo `q[...]`.
 */
export function useLogs(page = 1, itemType = "", event = "") {
  return useAdminList<LogAuditoria>(
    "versions",
    {
      page,
      ...(itemType ? { item_type: itemType } : {}),
      ...(event ? { event } : {}),
    },
    logsKeys.list(page, itemType, event),
  );
}
