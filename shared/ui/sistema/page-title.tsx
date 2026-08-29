import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * `<h1>` padrão de toda tela — nunca `<h1 className="text-2xl font-bold
 * text-base-content">` repetido por tela (era o padrão até este componente
 * existir, idêntico em ~28 arquivos). Tamanho vem de `--page-title-size`
 * (institucional, `app/layout.tsx`, ver `docs/APARENCIA-AVANCADA.md`) —
 * trocar o tamanho na Aparência muda **toda** tela de uma vez, nunca por
 * arquivo. Cor continua `text-base-content` de propósito: já é o token
 * DaisyUI que a Aparência também sabe sobrescrever (`cor_texto_sistema`),
 * então o título já segue esse override automaticamente, sem duplicar
 * lógica de cor aqui.
 */
export function PageTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={cn("font-bold text-base-content", className)} style={{ fontSize: "var(--page-title-size)" }}>
      {children}
    </h1>
  );
}
