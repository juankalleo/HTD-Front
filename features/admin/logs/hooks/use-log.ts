"use client";

import { useAdminGet } from "@/shared/hooks/use-admin-resource";
import { logsKeys } from "../constants/query-keys";
import type { LogAuditoria } from "../types";

export function useLog(id: number) {
  return useAdminGet<LogAuditoria>("versions", id, logsKeys.all);
}
