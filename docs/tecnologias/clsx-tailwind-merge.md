# clsx + tailwind-merge (`cn()`)

**O que é:** duas libs pequenas combinadas num helper só (`lib/cn.ts`):
`clsx` monta uma string de className a partir de condições (`ativo && "..."`,
objeto `{ classe: condição }`), `tailwind-merge` resolve conflito entre
utilities do Tailwind (ex.: `"px-2 px-4"` vira só `"px-4"`, a última vence,
em vez das duas ficarem no DOM brigando por especificidade).

**Por que essa:** porta direta do `lib/utils.ts` da `otica` (mesmo par de
libs, mesma função `cn`) — é o utilitário mais comum de qualquer projeto
Tailwind e o `base-front` tinha passado sem ele até agora, concatenando
className condicional na mão com template string. Trazido junto de uma
revisão da pasta `lib/` da `otica` pra ver o que fazia sentido portar (ver
[`DADOS-E-API.md`](../DADOS-E-API.md) pra a lista completa do que foi e não
foi trazido daquela pasta).

**Versão:** `clsx@^2.1.1`, `tailwind-merge@^3.6.0` (`package.json`).

**Como importar:**

```bash
pnpm add clsx tailwind-merge
```

```ts
// lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
import { cn } from "@/lib/cn";
```

**Exemplo real** — link ativo na sidebar (`shared/layout/app-sidebar.tsx`):

```tsx
<Link
  className={cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
    active ? "bg-primary/10 text-primary" : "text-base-content/70 hover:bg-base-200 hover:text-base-content",
  )}
>
```

Sem `cn()`, isso vira um template string com `${condição ? "a" : "b"}`
misturado nas classes fixas — funciona, mas fica ilegível conforme mais
condições entram. Use `cn()` sempre que houver **mais de uma** classe
condicional; pra uma condição só, o template string direto ainda é mais
simples.
