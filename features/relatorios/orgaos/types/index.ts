import type { ReferencialRecord } from "@/features/admin/referenciais/types";
import type { GrupoContagem } from "@/features/relatorios/shared/relatorio-utils";

export type RelatorioOrgaoLinha = ReferencialRecord;

export type RelatorioOrgaosKpis = {
  totalOrgaos: number;
  totalTenants: number;
  mediaPorTenant: string;
  totalUnidades: number;
};

export type RelatorioOrgaosResumo = {
  kpis: RelatorioOrgaosKpis;
  porTenant: (GrupoContagem & { unidades: number })[];
  unidadesPorOrgao: Record<number, number>;
};
