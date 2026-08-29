"use client";

import { useEffect, useState } from "react";
import { adminList } from "@/services/api-admin";
import { gerarRelatorioUsuariosPdf } from "@/services/api-relatorio-pdf";
import { urlAbsoluta } from "@/services/api-institucional";
import { useSession } from "@/features/autenticacao/login/hooks/use-session";
import { useConfiguracaoInstitucional } from "@/shared/hooks/use-configuracao-institucional";
import type { Usuario } from "@/features/admin/usuarios/types";
import { useRelatorioUsuariosKpis } from "./use-relatorio-usuarios-kpis";

/**
 * Dono de **como a rota de PDF de usuários é chamada** — o arquivo que
 * responde "de onde vêm os dados, o que é mandado pro servidor" pra essa
 * exportação específica (ver `docs/SEGURANCA-EXPORTACAO.md`: um arquivo
 * por relatório/formato, não um componente genérico escondendo o fluxo).
 * Roda a exportação inteira sozinho — busca o filtro **inteiro**
 * (`per_page` alto, não só a página visível), monta `marca`/`emissor` de
 * dado real (nunca inventado) e chama `gerarRelatorioUsuariosPdf`
 * (`services/api-relatorio-pdf.ts`, que já manda o Bearer token — ver
 * `lib/server/auth-guard.ts`) assim que a página de preview monta.
 */
export function useRelatorioUsuariosPdfPreview(params: { busca: string; tipoUsuarioId: string; tipoLabel: string }) {
  const { user } = useSession();
  const { data: config } = useConfiguracaoInstitucional();
  const { kpis, isLoading: isLoadingKpis } = useRelatorioUsuariosKpis();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [erro, setErro] = useState(false);

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

        const novoBlob = await gerarRelatorioUsuariosPdf({
          geradoEm: new Date().toISOString(),
          marca: { nome: config?.nome_sistema ?? "Sistema", iconeUrl: urlAbsoluta(config?.icone_sistema_url ?? null) },
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

        if (!cancelado) setBlob(novoBlob);
      } catch {
        if (!cancelado) setErro(true);
      }
    })();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- config/user só entram quando kpis fica pronto; refazer a cada render deles reprocessaria o PDF à toa
  }, [kpis, isLoadingKpis, user, params.busca, params.tipoUsuarioId, params.tipoLabel]);

  return { blob, isGerando: isLoadingKpis || (!blob && !erro), erro };
}
