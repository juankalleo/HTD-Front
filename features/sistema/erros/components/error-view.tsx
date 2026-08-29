"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ROUTES } from "@/lib/routes";
import { PageTitle } from "@/shared/ui";

type ErrorViewProps = {
  error: Error & { digest?: string };
  retry: () => void;
  titulo?: string;
  descricao?: string;
};

export function ErrorView({
  error,
  retry,
  titulo = "Algo saiu do esperado",
  descricao = "A tela encontrou um erro inesperado. Você pode tentar carregar de novo ou voltar ao início.",
}: ErrorViewProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <PageTitle>{titulo}</PageTitle>
      <p className="max-w-sm text-sm text-base-content/60">{descricao}</p>
      <div className="flex gap-3">
        <button type="button" onClick={() => retry()} className="btn btn-primary">
          Tentar novamente
        </button>
        <Link href={ROUTES.dashboard_path} className="btn btn-outline">
          Ir para o início
        </Link>
      </div>
    </div>
  );
}
