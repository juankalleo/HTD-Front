"use client";

/**
 * Paginação padrão das listas admin — anterior/página atual/próximo via
 * DaisyUI `join`, mais um campo pra digitar e ir direto pra página desejada.
 * Sempre visível (mesmo com 1 página só, os botões ficam desabilitados) —
 * é o mesmo lugar/tamanho de tela em toda lista, não pisca sumindo/
 * aparecendo conforme o resultado da busca muda de 1 pra várias páginas.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const goTo = (raw: number) => {
    const target = Math.min(Math.max(1, Math.trunc(raw) || 1), totalPages);
    if (target !== page) onPageChange(target);
  };

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      <div className="join">
        <button
          type="button"
          className="join-item btn btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          «
        </button>
        <span className="join-item btn btn-sm btn-disabled">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="join-item btn btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          »
        </button>
      </div>

      <div className="join">
        <span className="join-item btn btn-sm btn-disabled">Ir para</span>
        <input
          key={page}
          type="number"
          min={1}
          max={totalPages}
          defaultValue={page}
          aria-label="Ir para a página"
          onKeyDown={(e) => {
            if (e.key === "Enter") goTo(Number((e.target as HTMLInputElement).value));
          }}
          onBlur={(e) => goTo(Number(e.target.value))}
          className="join-item input input-bordered input-sm w-16 [appearance:textfield]"
        />
      </div>
    </div>
  );
}
