"use client";

import { useEffect, useState } from "react";
import { adminList } from "@/services/api-admin";
import { gerarRelatorioExcel, montarDadosExcelUsuarios, type RelatorioExcelDados } from "@/services/api-relatorio-excel";
import { baixarArquivo } from "@/lib/download-arquivo";
import { useSession } from "@/features/autenticacao/login/hooks/use-session";
import { useConfiguracaoInstitucional } from "@/shared/hooks/use-configuracao-institucional";
import { Toast } from "@/shared/ui";
import type { Usuario } from "@/features/admin/usuarios/types";
import { useRelatorioUsuariosKpis } from "./use-relatorio-usuarios-kpis";

/**
 * Dono de **como a rota de Excel de usuários é chamada** — mesmo papel de
 * `use-relatorio-usuarios-pdf-preview.ts` (ver `docs/SEGURANCA-EXPORTACAO.md`),
 * fluxo diferente de propósito: a pré-visualização mostra os **dados**
 * (`RelatorioExcelDados`) assim que a página monta (sem round-trip ao
 * servidor — ExcelJS só roda quando `confirmarDownload` chama
 * `gerarRelatorioExcel`, já com o Bearer token, ver
 * `services/api-relatorio-excel.ts`/`lib/server/auth-guard.ts`).
 */
export function useRelatorioUsuariosExcelPreview(params: { busca: string; tipoUsuarioId: string; tipoLabel: string }) {
  const { user } = useSession();
  const { data: config } = useConfiguracaoInstitucional();
  const { kpis, isLoading: isLoadingKpis } = useRelatorioUsuariosKpis();
  const [dados, setDados] = useState<RelatorioExcelDados | null>(null);
  const [erro, setErro] = useState(false);
  const [isGerando, setIsGerando] = useState(false);

  useEffect(() => {
    if (!kpis || !user || isLoadingKpis) return;

    let cancelado = false;

    (async () => {
      try {
        const resultado = await adminList<Usuario>("users", {
          per_page: 1000,
          ...(params.busca ? { "q[nome_cont]": params.busca } : {}),
          ...(params.tipoUsuarioId ? { "q[a_tipo_usuario_id_eq]": params.tipoUsuarioId } : {}),
        });

        const novosDados = montarDadosExcelUsuarios({
          geradoEm: new Date().toISOString(),
          marca: { nome: config?.nome_sistema ?? "Sistema" },
          emissor: { nome: user.nome, contexto: [user.email, config?.a_tenant?.nome].filter(Boolean).join(" · ") },
          filtro: { busca: params.busca, tipoLabel: params.tipoLabel },
          kpis: {
            total: kpis.total,
            porTipo: kpis.porTipo.map((item) => ({ descricao: item.descricao, total: item.total })),
          },
          linhas: resultado.items.map((usuario) => ({
            nome: usuario.nome,
            tipo: usuario.a_tipo_usuario?.descricao ?? "—",
          })),
        });

        if (!cancelado) setDados(novosDados);
      } catch {
        if (!cancelado) setErro(true);
      }
    })();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- config/user só entram quando kpis fica pronto
  }, [kpis, isLoadingKpis, user, params.busca, params.tipoUsuarioId, params.tipoLabel]);

  async function confirmarDownload() {
    if (!dados) return;

    setIsGerando(true);
    try {
      const blob = await gerarRelatorioExcel("institucional", dados);
      baixarArquivo(blob, dados.filename);
    } catch {
      void Toast.error({ title: "Não foi possível gerar a planilha", description: "Tente novamente." });
    } finally {
      setIsGerando(false);
    }
  }

  return { dados, isPreparando: isLoadingKpis || (!dados && !erro), erro, confirmarDownload, isGerando };
}
