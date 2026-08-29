/**
 * Espelha as variáveis CSS que o DaisyUI gera pro tema ativo
 * (`data-theme` em app/layout.tsx, escolhido em features/sistema/temas).
 * Não são valores fixos — mudam sozinhos quando o tema muda. Só existe
 * pra quando algum componente precisa do valor em JS (ex.: canvas, gráfico);
 * pra estilizar normal, usa as classes do Tailwind/DaisyUI direto
 * (`bg-primary`, `text-error`...), não isto aqui.
 */
export const colors = {
  base: {
    100: "var(--color-base-100)",
    200: "var(--color-base-200)",
    300: "var(--color-base-300)",
    content: "var(--color-base-content)",
  },
  primary: {
    main: "var(--color-primary)",
    content: "var(--color-primary-content)",
  },
  secondary: {
    main: "var(--color-secondary)",
    content: "var(--color-secondary-content)",
  },
  accent: {
    main: "var(--color-accent)",
    content: "var(--color-accent-content)",
  },
  neutral: {
    main: "var(--color-neutral)",
    content: "var(--color-neutral-content)",
  },
  status: {
    info: { main: "var(--color-info)", content: "var(--color-info-content)" },
    success: { main: "var(--color-success)", content: "var(--color-success-content)" },
    warning: { main: "var(--color-warning)", content: "var(--color-warning-content)" },
    error: { main: "var(--color-error)", content: "var(--color-error-content)" },
  },
} as const;

export type ColorTokens = typeof colors;
