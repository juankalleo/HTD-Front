"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { useConfiguracaoInstitucional } from "@/shared/hooks/use-configuracao-institucional";

/**
 * `cor_borda_tabela` (Aparência institucional, ver docs/APARENCIA-AVANCADA.md)
 * é uma exceção *mais específica* que `cor_borda_sistema`: quando definida,
 * toda borda de tabela usa essa cor em vez do `--color-base-300` (que
 * `cor_borda_sistema` já pode ter sobrescrito globalmente em
 * app/layout.tsx). Sem ela, a tabela cai pro `border-base-300` normal —
 * já refletindo `cor_borda_sistema` se esse estiver definido, porque os
 * dois usam a mesma cascata de CSS var, só a tabela pode ir além.
 * `useConfiguracaoInstitucional()` é cacheado pelo React Query — chamar em
 * cada primitivo (Table/TableRow/TableHead/TableCell) não gera 4 requests.
 */
function useCorBordaTabela() {
  const { data: config } = useConfiguracaoInstitucional();
  return config?.cor_borda_tabela || undefined;
}

export function Table({ className, style, ...props }: ComponentProps<"table">) {
  const corBordaTabela = useCorBordaTabela();
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-lg border border-base-300"
      style={{ borderColor: corBordaTabela }}
    >
      <table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} style={style} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" className={cn("border-t bg-base-200 font-medium [&>tr]:last:border-b-0", className)} {...props} />;
}

export function TableRow({ className, style, ...props }: ComponentProps<"tr">) {
  const corBordaTabela = useCorBordaTabela();
  return (
    <tr
      data-slot="table-row"
      className={cn("border-b border-base-300 transition-colors hover:bg-base-200/70 data-[state=selected]:bg-base-200", className)}
      style={{ borderColor: corBordaTabela, ...style }}
      {...props}
    />
  );
}

export function TableHead({ className, style, ...props }: ComponentProps<"th">) {
  const corBordaTabela = useCorBordaTabela();
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 bg-base-200 px-3 text-left align-middle font-semibold text-base-content whitespace-nowrap border-r border-base-300 last:border-r-0",
        className,
      )}
      style={{ borderColor: corBordaTabela, ...style }}
      {...props}
    />
  );
}

export function TableCell({ className, style, ...props }: ComponentProps<"td">) {
  const corBordaTabela = useCorBordaTabela();
  return (
    <td
      data-slot="table-cell"
      className={cn("px-3 py-3 align-middle text-base-content border-r border-base-300 last:border-r-0", className)}
      style={{ borderColor: corBordaTabela, ...style }}
      {...props}
    />
  );
}

export function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("mt-4 text-sm text-base-content/60", className)} {...props} />;
}
