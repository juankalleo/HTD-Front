import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { PageTitle } from "./page-title";

/**
 * Layout padrão das telas de formulário (novo/edição) do admin. A tela fica
 * alinhada ao fluxo normal do conteúdo, aproveitando a área livre do shell em
 * vez de parecer um modal centralizado.
 */
type FormScreenSize = "sm" | "md" | "lg" | "full";

const TAMANHOS: Record<FormScreenSize, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  full: "max-w-none",
};

export function FormScreen({
  title,
  backHref,
  backLabel,
  size = "lg",
  children,
}: {
  title: string;
  backHref: string;
  backLabel: string;
  size?: FormScreenSize;
  children: ReactNode;
}) {
  return (
    <div className="w-full px-6 py-10">
      <div className={cn("w-full", TAMANHOS[size])}>
        <div className="mb-6">
          <Link href={backHref} className="link link-hover text-sm text-base-content/60">
            ← {backLabel}
          </Link>
          <PageTitle className="mt-2">{title}</PageTitle>
        </div>
        {children}
      </div>
    </div>
  );
}
