/**
 * Espelha `VersionLogSerializer` (api/app/serializers/version_log_serializer.rb)
 * — `PaperTrail::Version` (log de auditoria automático, `has_paper_trail` em
 * `ApplicationRecord`). `payload` é a coluna `object` do PaperTrail, exposta
 * como string YAML crua — a API não desserializa, o front também não; é
 * mostrada como texto, nunca interpretada como dado estruturado (ver
 * docs/LOGS-DE-AUDITORIA.md pro porquê).
 */
export type LogAuditoriaEvento = "create" | "update" | "destroy";

export type LogAuditoria = {
  id: number;
  item_type: string;
  item_id: number;
  event: LogAuditoriaEvento;
  whodunnit: string | null;
  usuario: string | null;
  payload: string | null;
  created_at: string;
};
