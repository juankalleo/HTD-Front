export type GrupoContagem = {
  id: string;
  label: string;
  total: number;
};

export function texto(valor: string | number | null | undefined, fallback = "-") {
  if (typeof valor === "number" && Number.isFinite(valor)) return String(valor);
  if (typeof valor === "string" && valor.trim()) return valor.trim();
  return fallback;
}

export function textoCurto(valor: string, limite = 12) {
  return valor.length > limite ? `${valor.slice(0, limite).trimEnd()}...` : valor;
}

export function percentual(parte: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((parte / total) * 100);
}

export function formatarNumero(valor: number) {
  return new Intl.NumberFormat("pt-BR").format(valor);
}

export function contarPorGrupo<T>(
  items: T[],
  getGrupo: (item: T) => { id: string | number | null | undefined; label: string | null | undefined },
  fallback = "Sem vínculo",
) {
  const grupos = new Map<string, GrupoContagem>();

  for (const item of items) {
    const grupo = getGrupo(item);
    const id = grupo.id === null || grupo.id === undefined || grupo.id === "" ? "__sem_vinculo__" : String(grupo.id);
    const atual = grupos.get(id) ?? { id, label: texto(grupo.label, fallback), total: 0 };
    grupos.set(id, { ...atual, total: atual.total + 1 });
  }

  return [...grupos.values()].sort((left, right) => right.total - left.total || left.label.localeCompare(right.label));
}
