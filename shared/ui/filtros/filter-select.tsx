"use client";

/**
 * Filtro padrão das listas admin — `<select>` que vira `q[<campo>_eq]` no
 * hook de listagem (mesmo raciocínio do `SearchInput`, ver `TABELAS.md`).
 * `""` sempre representa "todos" — nunca manda o param quando vazio.
 */
export function FilterSelect({
  label,
  valor,
  opcoes,
  onChange,
}: {
  label: string;
  valor: string;
  opcoes: { valor: string; label: string }[];
  onChange: (valor: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-base-content/60">{label}</span>
      <select className="select select-sm w-auto" value={valor} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todos</option>
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.label}
          </option>
        ))}
      </select>
    </label>
  );
}
