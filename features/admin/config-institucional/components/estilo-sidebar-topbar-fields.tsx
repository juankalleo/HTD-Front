"use client";

import { FONTES_INSTITUCIONAIS } from "@/theme/fonts";

/**
 * Dois campos reutilizáveis pros overrides de Sidebar/Topbar (ver
 * `AparenciaForm` — seção "Sidebar e topbar" — e
 * `docs/APARENCIA-AVANCADA.md`). Cada campo real (fonte da sidebar,
 * cor da topbar etc.) é só uma instância de um destes dois, nunca um
 * `<select>`/`<input>` solto reescrito por campo — a única coisa que muda
 * de um pro outro é label/nome, não o comportamento.
 *
 * Os dois representam "sem override" com string vazia (`""`), nunca
 * `undefined`/removendo o campo do form — mantém o mesmo padrão de
 * `escala`/`aTipoUsuarioId` (RHF + `<select>` só lida bem com string).
 */

export function FonteOverrideField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-base-content" htmlFor={id}>
        {label}
      </label>
      <select id={id} className="select select-sm w-full" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Padrão (fonte do sistema)</option>
        {FONTES_INSTITUCIONAIS.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CorOverrideField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
}) {
  const temOverride = value !== "";

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-base-content" htmlFor={id}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          className="h-9 w-12 shrink-0 cursor-pointer rounded border border-base-300 bg-base-100 p-1"
          value={temOverride ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
        />
        {temOverride ? (
          <>
            <span className="font-mono text-xs text-base-content/70 uppercase">{value}</span>
            <button type="button" className="btn btn-ghost btn-xs ml-auto" onClick={() => onChange("")}>
              Usar padrão do tema
            </button>
          </>
        ) : (
          <span className="text-xs text-base-content/50">Padrão do tema</span>
        )}
      </div>
    </div>
  );
}
