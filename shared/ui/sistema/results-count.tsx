"use client";

import type { PagyInfo } from "@/services/api-admin";

/** Contador padrão das listas admin — "Mostrando X–Y de Z" a partir do `pagy` que toda listagem paginada já devolve. */
export function ResultsCount({ pagy }: { pagy: PagyInfo }) {
  if (pagy.total_count === 0) {
    return <p className="text-xs text-base-content/60">Nenhum registro encontrado.</p>;
  }

  const inicio = (pagy.current_page - 1) * pagy.per_page + 1;
  const fim = Math.min(pagy.current_page * pagy.per_page, pagy.total_count);

  return (
    <p className="text-xs text-base-content/60">
      Mostrando {inicio}–{fim} de {pagy.total_count}
    </p>
  );
}
