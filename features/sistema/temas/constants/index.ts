/**
 * Chave de localStorage — precisa bater com o script inline em app/layout.tsx
 * (evita flash de tema errado antes da hidratação).
 */
export const THEME_STORAGE_KEY = "theme";

/**
 * Lista curada dos temas do DaisyUI habilitados em app/globals.css
 * (`@plugin "daisyui" { themes: ... }`). DaisyUI vem com ~30 temas prontos;
 * restringimos a esses de propósito — tom mais "enterprise", já que o
 * backend deste padrão é vendido a órgão público (ver api/CLAUDE.md).
 * A ordem aqui é a mesma exibida no seletor de tema (features/sistema/temas).
 */
export const TEMAS_DISPONIVEIS = [
  { valor: "light", label: "Claro" },
  { valor: "dark", label: "Escuro" },
  { valor: "corporate", label: "Corporate" },
  { valor: "business", label: "Business" },
  { valor: "cupcake", label: "Cupcake" },
  { valor: "emerald", label: "Esmeralda" },
  { valor: "garden", label: "Jardim" },
  { valor: "winter", label: "Inverno" },
  { valor: "nord", label: "Nord" },
  { valor: "dim", label: "Dim" },
  { valor: "retro", label: "Retrô" },
  { valor: "lofi", label: "Lofi" },
] as const;

export type TemaValor = (typeof TEMAS_DISPONIVEIS)[number]["valor"];
