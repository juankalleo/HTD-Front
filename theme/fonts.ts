/** Espelha os tokens definidos em app/globals.css (bloco @theme). */
export const fonts = {
  family: {
    sans: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
  },
  size: {
    /* xs / sm: labels, mensagens de erro, texto auxiliar */
    xs: "var(--font-size-xs)",
    sm: "var(--font-size-sm)",
    /* base: corpo do texto, inputs */
    base: "var(--font-size-base)",
    /* lg / xl: subtítulos, cabeçalhos de card */
    lg: "var(--font-size-lg)",
    xl: "var(--font-size-xl)",
    /* 2xl+: título de página */
    "2xl": "var(--font-size-2xl)",
    "3xl": "var(--font-size-3xl)",
  },
  weight: {
    regular: "var(--font-weight-regular)",
    medium: "var(--font-weight-medium)",
    semibold: "var(--font-weight-semibold)",
    bold: "var(--font-weight-bold)",
  },
} as const;

export type FontTokens = typeof fonts;

/**
 * Vocabulário de fontes que a Configuração Institucional
 * (features/admin/config-institucional) pode escolher — espelha
 * `CConfiguracao::FONTES` na api/. Cada valor aponta pra uma CSS var
 * carregada via `next/font/google` em app/layout.tsx; o admin escolhe pelo
 * `valor`, o layout sobrescreve `--font-sans` (ver app/globals.css) com o
 * `cssVar` correspondente.
 */
export const FONTES_INSTITUCIONAIS = [
  { valor: "geist", label: "Geist (padrão)", cssVar: "var(--font-geist-sans)" },
  { valor: "inter", label: "Inter", cssVar: "var(--font-inter)" },
  { valor: "roboto", label: "Roboto", cssVar: "var(--font-roboto)" },
  { valor: "open-sans", label: "Open Sans", cssVar: "var(--font-open-sans)" },
  { valor: "lato", label: "Lato", cssVar: "var(--font-lato)" },
  { valor: "montserrat", label: "Montserrat", cssVar: "var(--font-montserrat)" },
  { valor: "poppins", label: "Poppins", cssVar: "var(--font-poppins)" },
  { valor: "source-sans", label: "Source Sans", cssVar: "var(--font-source-sans)" },
  { valor: "nunito", label: "Nunito", cssVar: "var(--font-nunito)" },
  { valor: "work-sans", label: "Work Sans", cssVar: "var(--font-work-sans)" },
  { valor: "rubik", label: "Rubik", cssVar: "var(--font-rubik)" },
  { valor: "raleway", label: "Raleway", cssVar: "var(--font-raleway)" },
  { valor: "ibm-plex-sans", label: "IBM Plex Sans", cssVar: "var(--font-ibm-plex-sans)" },
] as const;

export type FonteInstitucionalValor = (typeof FONTES_INSTITUCIONAIS)[number]["valor"];

export function cssVarDaFonte(valor: string): string {
  return FONTES_INSTITUCIONAIS.find((f) => f.valor === valor)?.cssVar ?? "var(--font-geist-sans)";
}

/** Espelha `CConfiguracao::ESCALAS` na api/ — porcentagem, não fator (110 = 110%). */
export const ESCALAS_INSTITUCIONAIS = [90, 100, 110, 125, 150, 175, 200, 225, 250] as const;

export function fatorDaEscala(escala: number): number {
  return escala / 100;
}

/** Espelha `CConfiguracao::TAMANHOS_TITULO_PAGINA` — cada valor é um `--font-size-*` real de app/globals.css. */
export const TAMANHOS_TITULO_PAGINA = ["xl", "2xl", "3xl"] as const;

export function cssVarDoTamanhoTitulo(valor: string): string {
  const valido = (TAMANHOS_TITULO_PAGINA as readonly string[]).includes(valor) ? valor : "2xl";
  return `var(--font-size-${valido})`;
}
