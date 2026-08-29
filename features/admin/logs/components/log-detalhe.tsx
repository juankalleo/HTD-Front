"use client";

import { useLog } from "../hooks/use-log";

const EVENTO_LABEL: Record<string, string> = { create: "Criação", update: "Alteração", destroy: "Exclusão" };

export function LogDetalhe({ id }: { id: number }) {
  const { data: log, isLoading } = useLog(id);

  if (isLoading) return <p className="text-sm text-base-content/60">Carregando...</p>;
  if (!log) return <p className="text-sm text-base-content/60">Log não encontrado.</p>;

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-base-content/50">Quando</dt>
          <dd className="text-sm text-base-content">{new Date(log.created_at).toLocaleString("pt-BR")}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-base-content/50">Ação</dt>
          <dd className="text-sm text-base-content">{EVENTO_LABEL[log.event] ?? log.event}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-base-content/50">Registro</dt>
          <dd className="text-sm text-base-content">
            {log.item_type} #{log.item_id}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-base-content/50">Quem</dt>
          <dd className="text-sm text-base-content">{log.usuario ?? "—"}</dd>
        </div>
      </dl>

      <div>
        <p className="mb-2 text-xs font-semibold text-base-content/50">
          Payload (estado do registro antes desta mudança, formato YAML bruto)
        </p>
        <pre className="max-h-[28rem] overflow-auto rounded-lg border border-base-300 bg-base-200 p-4 text-xs text-base-content">
          {log.payload ?? "Sem payload."}
        </pre>
      </div>
    </div>
  );
}
