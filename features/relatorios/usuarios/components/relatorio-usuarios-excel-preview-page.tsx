"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { PageTitle, KpiCounter } from "@/shared/ui";
import { useTiposUsuario } from "@/features/admin/tipos-usuario/hooks/use-tipos-usuario";
import { useRelatorioUsuariosExcelPreview } from "../hooks/use-relatorio-usuarios-excel-preview";

/**
 * Página de pré-visualização do Excel de usuários (`/relatorios/usuarios/
 * excel-preview?busca=...&tipo=...`) — mesmo raciocínio da página de PDF
 * (rota própria, não modal), com o arquivo específico de como ela é
 * montada em `use-relatorio-usuarios-excel-preview.ts` (ver
 * `docs/SEGURANCA-EXPORTACAO.md`). `.xlsx` não tem visualizador nativo no
 * navegador — a pré-visualização mostra a tabela a partir dos MESMOS dados
 * que viram a planilha, sem gerar o arquivo real até o clique em "Baixar".
 */
export function RelatorioUsuariosExcelPreviewPage() {
  const searchParams = useSearchParams();
  const busca = searchParams.get("busca") ?? "";
  const tipoUsuarioId = searchParams.get("tipo") ?? "";
  const { data: tipos } = useTiposUsuario();
  const tipoLabel = tipos?.items.find((tipo) => String(tipo.id) === tipoUsuarioId)?.descricao ?? "";

  const { dados, isPreparando, erro, confirmarDownload, isGerando } = useRelatorioUsuariosExcelPreview({
    busca,
    tipoUsuarioId,
    tipoLabel,
  });

  return (
    <div className="px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link href={ROUTES.relatorios_usuarios_path} className="link link-hover text-sm text-base-content/60">
            ← Relatório de usuários
          </Link>
          <PageTitle className="mt-2">Pré-visualização da planilha</PageTitle>
        </div>
        {dados && (
          <button type="button" className="btn btn-primary btn-sm" disabled={isGerando} onClick={() => void confirmarDownload()}>
            {isGerando ? "Gerando..." : "Baixar Excel"}
          </button>
        )}
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-error/10 px-3.5 py-2.5 text-sm font-medium text-error">
          Não foi possível preparar a planilha. Volte e tente exportar de novo.
        </p>
      )}

      {isPreparando && !erro && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-base-content/60">
          <span className="loading loading-spinner loading-md text-primary" />
          <p className="text-sm">Preparando planilha...</p>
        </div>
      )}

      {dados && (
        <div className="space-y-4">
          {dados.kpis.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {dados.kpis.map((kpi) => (
                <KpiCounter key={kpi.label} label={kpi.label} value={kpi.value} />
              ))}
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-base-300">
            <table className="table">
              <thead>
                <tr>
                  {dados.columns.map((coluna) => (
                    <th key={coluna.key}>{coluna.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dados.rows.map((row, index) => (
                  <tr key={index}>
                    {dados.columns.map((coluna) => (
                      <td key={coluna.key}>{String(row[coluna.key] ?? "—")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
