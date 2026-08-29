import type { ReferencialRecord } from "@/features/admin/referenciais/types";
import type { GrupoContagem } from "@/features/relatorios/shared/relatorio-utils";

export type RelatorioUnidadeLinha = ReferencialRecord;

export type RelatorioUnidadesKpis = {
  totalUnidades: number;
  orgaosComUnidade: number;
  tiposUsados: number;
  municipiosAtendidos: number;
};

export type RelatorioUnidadesResumo = {
  kpis: RelatorioUnidadesKpis;
  porTipo: (GrupoContagem & { orgaos: number })[];
  porMunicipio: GrupoContagem[];
};
