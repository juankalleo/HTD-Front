/**
 * Contrato de DADOS de um relatório em PDF — independente de estilo. A
 * mesma forma serve pra qualquer template em `templates/*`; quem decide a
 * aparência é o campo `template` (ver `index.ts`), nunca o payload em si.
 * Isso é o que deixa "relatório tal" (dados) e "estilo tal" (apresentação)
 * organizados em lugares separados: um relatório novo só monta este objeto
 * e escolhe um template já existente — não precisa saber nada de HTML/CSS.
 */
export type RelatorioPdfDados = {
  filename: string;
  geradoEm: string; // ISO 8601
  title: string;
  subtitle?: string;
  /** Marca do sistema (Identidade institucional) — ver `docs/ESTILOS-DE-PDF.md`. Opcional: nem todo template usa. */
  marca?: { nome: string; iconeUrl?: string | null };
  /** Quem emitiu (usuário logado) — rodapé/assinatura. Opcional: nem todo template usa. */
  emissor?: { nome: string; contexto?: string };
  filtros?: { label: string; value: string }[];
  kpis: { label: string; value: number | string }[];
  columns: { key: string; label: string; align?: "left" | "right" | "center" }[];
  rows: Record<string, string | number | null | undefined>[];
};

export type RelatorioPdfTemplateNome = "simples" | "institucional";

export type RelatorioPdfOpcoes = {
  landscape?: boolean;
  margin?: { top: string; right: string; bottom: string; left: string };
};

export type RelatorioPdfTemplate = {
  montarHtml: (dados: RelatorioPdfDados) => string;
  opcoesPdf?: RelatorioPdfOpcoes;
};
