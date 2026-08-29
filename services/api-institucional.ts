import { getAccessToken } from "@/lib/auth";
import { extrairMensagem } from "@/lib/error-utils";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export type ConfiguracaoInstitucional = {
  id: number | null;
  nome_sistema: string;
  tema: string;
  fonte: string;
  escala: number;
  largura_sidebar: number;
  altura_topbar: number;
  imagem_fundo_login_url: string | null;
  icone_sistema_url: string | null;
  /**
   * Overrides de fonte/cor pra sidebar e topbar — por cima do tema/`fonte`
   * (que só afeta o conteúdo da página, nunca o shell). Todos opcionais:
   * `null` = sem override, sidebar/topbar seguem 100% o tema DaisyUI ativo.
   * Ver `docs/APARENCIA-AVANCADA.md`.
   */
  fonte_sidebar: string | null;
  fonte_titulos_sidebar: string | null;
  fonte_topbar: string | null;
  cor_titulos_sidebar: string | null;
  cor_sidebar: string | null;
  cor_rotas_sidebar: string | null;
  cor_topbar: string | null;
  /**
   * Tamanho do `<h1>` de página (`shared/ui/sistema/page-title.tsx`) —
   * vocabulário fechado (`xl`/`2xl`/`3xl`), sempre tem valor (não é
   * override opcional como os de cima). Ver `docs/APARENCIA-AVANCADA.md`.
   */
  tamanho_titulo_pagina: string;
  /**
   * Cor de borda (sistema geral + tabela, independentes — tabela é exceção
   * mais específica) e cor de texto do sistema — sobrescrevem direto o
   * token DaisyUI que já é usado em tudo (`--color-base-300`/
   * `--color-base-content`), aplicado em `app/layout.tsx`. `null` = tema
   * ativo, sem override. Ver `docs/APARENCIA-AVANCADA.md`.
   */
  cor_borda_sistema: string | null;
  cor_borda_tabela: string | null;
  cor_texto_sistema: string | null;
  a_tenant: { id: number; nome: string } | null;
};

const CONFIGURACAO_PADRAO: ConfiguracaoInstitucional = {
  id: null,
  nome_sistema: "HTD Front",
  tema: "light",
  fonte: "geist",
  escala: 100,
  largura_sidebar: 288,
  altura_topbar: 64,
  imagem_fundo_login_url: null,
  icone_sistema_url: null,
  fonte_sidebar: null,
  fonte_titulos_sidebar: null,
  fonte_topbar: null,
  cor_titulos_sidebar: null,
  cor_sidebar: null,
  cor_rotas_sidebar: null,
  cor_topbar: null,
  tamanho_titulo_pagina: "2xl",
  cor_borda_sistema: null,
  cor_borda_tabela: null,
  cor_texto_sistema: null,
  a_tenant: null,
};

export function urlAbsoluta(path: string | null) {
  if (!path || !BASE_URL) return null;
  return `${BASE_URL}${path}`;
}

/**
 * GET /api/v1/c_configuracoes/atual — endpoint público (não exige sessão),
 * ver Api::V1::CConfiguracoesController#atual na api/. Funciona tanto no
 * servidor (layout raiz, sem token — resolve pelo primeiro tenant) quanto no
 * client (`getAccessToken()` volta `null` fora do browser, sem quebrar).
 * Nunca lança — sem `NEXT_PUBLIC_API_URL` ou com a API fora do ar, cai no
 * padrão local pra nunca travar a renderização por causa de branding.
 */
export async function fetchConfiguracaoInstitucional(): Promise<ConfiguracaoInstitucional> {
  if (!BASE_URL) return CONFIGURACAO_PADRAO;

  try {
    const token = getAccessToken();
    const response = await fetch(`${BASE_URL}/api/v1/c_configuracoes/atual`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });
    if (!response.ok) return CONFIGURACAO_PADRAO;

    const payload = (await response.json()) as { data: ConfiguracaoInstitucional };
    return payload.data ?? CONFIGURACAO_PADRAO;
  } catch {
    return CONFIGURACAO_PADRAO;
  }
}

export class ConfiguracaoInstitucionalApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * PATCH /api/v1/admin/c_configuracoes/:id — só admin. `FormData` (não JSON)
 * porque `imagem_fundo_login`/`icone_sistema` são upload de arquivo
 * (ActiveStorage do lado da api/); nunca define `Content-Type` na mão, o
 * browser monta o boundary do multipart sozinho a partir do FormData.
 */
export async function updateConfiguracaoInstitucionalAdmin(id: number, formData: FormData): Promise<ConfiguracaoInstitucional> {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_API_URL não configurada.");

  const token = getAccessToken();
  if (!token) throw new ConfiguracaoInstitucionalApiError("Sem sessão.", 401);

  const response = await fetch(`${BASE_URL}/api/v1/admin/c_configuracoes/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ConfiguracaoInstitucionalApiError(extrairMensagem(payload, "Não foi possível salvar a configuração."), response.status);
  }

  return (payload as { data: ConfiguracaoInstitucional }).data;
}
