"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { PageTitle } from "@/shared/ui";
import { useTiposUsuario } from "@/features/admin/tipos-usuario/hooks/use-tipos-usuario";
import { useRelatorioUsuariosPdfPreview } from "../hooks/use-relatorio-usuarios-pdf-preview";

/**
 * Página de pré-visualização do PDF de usuários (`/relatorios/usuarios/
 * pdf-preview?busca=...&tipo=...`) — não é modal de propósito (ver
 * `docs/SEGURANCA-EXPORTACAO.md`): rota própria, com o arquivo específico
 * de como ela é montada (`use-relatorio-usuarios-pdf-preview.ts`) fácil de
 * auditar isolado do resto da tela de listagem.
 */
export function RelatorioUsuariosPdfPreviewPage() {
  const searchParams = useSearchParams();
  const busca = searchParams.get("busca") ?? "";
  const tipoUsuarioId = searchParams.get("tipo") ?? "";
  const { data: tipos } = useTiposUsuario();
  const tipoLabel = tipos?.items.find((tipo) => String(tipo.id) === tipoUsuarioId)?.descricao ?? "";

  const { blob, isGerando, erro } = useRelatorioUsuariosPdfPreview({ busca, tipoUsuarioId, tipoLabel });
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return (
    <div className="flex h-full flex-col px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link href={ROUTES.relatorios_usuarios_path} className="link link-hover text-sm text-base-content/60">
            ← Relatório de usuários
          </Link>
          <PageTitle className="mt-2">Pré-visualização do PDF</PageTitle>
        </div>
        {url && (
          <a href={url} download="relatorio-usuarios.pdf" className="btn btn-primary btn-sm">
            Baixar PDF
          </a>
        )}
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-error/10 px-3.5 py-2.5 text-sm font-medium text-error">
          Não foi possível gerar o PDF. Volte e tente exportar de novo.
        </p>
      )}

      {isGerando && !erro && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-base-content/60">
          <span className="loading loading-spinner loading-md text-primary" />
          <p className="text-sm">Gerando PDF...</p>
        </div>
      )}

      {url && (
        <iframe src={url} title="Pré-visualização do PDF" className="w-full flex-1 rounded-lg border border-base-300 bg-base-200" />
      )}
    </div>
  );
}
