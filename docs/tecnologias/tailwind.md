# Tailwind CSS

**O que é:** framework CSS utility-first — classes prontas (`px-4`,
`text-sm`, `rounded-lg`) direto no JSX, sem escrever arquivo `.css` por
componente.

**Por que essa:** camada de acabamento visual do projeto — espaçamento,
cor, responsividade, alinhamento, estados. Componente pronto vem do DaisyUI
(ver [`daisyui.md`](daisyui.md)), acabamento fino é Tailwind puro. Decisão
mantida mesmo depois de avaliar shadcn/ui e MUI X Charts pra relatórios —
os dois foram descartados (ver [`shadcn-ui.md`](shadcn-ui.md) e
[`mui-x-charts.md`](mui-x-charts.md)). Gráficos entram por ECharts com
wrappers locais, sem trocar o design system.

**Versão:** `^4` (`package.json`) — Tailwind v4, configuração via
`@import "tailwindcss"` direto no CSS (`app/globals.css`), sem
`tailwind.config.js`.

**Como importar:** nada pra importar por arquivo — as classes funcionam
direto no `className` de qualquer elemento, desde que `app/globals.css`
esteja importado no layout raiz (já está, por padrão do scaffold).

**Exemplo real** — `shared/forms/form-field.tsx`, campo de formulário
padrão do projeto:

```tsx
export function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-base-content" htmlFor={id}>
        {label}
      </label>
      <input id={id} className={`input w-full ${error ? "input-error" : ""}`} {...inputProps} />
      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  );
}
```

Cor **nunca** é fixa (`slate-900`, `red-600`...) — sempre um token
semântico do DaisyUI (`text-base-content`, `text-error`, `bg-primary/10`).
É esse vocabulário de tokens que troca sozinho quando o tema muda
(`data-theme` no `<html>`, tema institucional ou pessoal — ver
[`../CONFIGURACAO-INSTITUCIONAL.md`](../CONFIGURACAO-INSTITUCIONAL.md)).
Usar uma cor Tailwind fixa quebra esse contrato: o elemento para de reagir
à troca de tema.
