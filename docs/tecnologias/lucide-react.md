# lucide-react

**O que é:** biblioteca de ícones SVG como componente React (`<Search />`,
`<Menu />`...).

**Por que essa:** escolhida na fase de "Sistema" (design tokens) em vez de
`@hugeicons/react` — recomendação padrão, licença permissiva, tree-shakeable
(só entra no bundle o ícone realmente importado) e é a mesma lib usada nos
projetos de referência.

**Versão:** `^1.34.0` (`package.json`).

**Como importar:**

Nunca direto de `lucide-react` no componente — sempre pelo barrel curado em
`theme/icons.tsx`:

```tsx
// theme/icons.tsx — reexporta só o que já é usado em algum componente,
// nada especulativo; cresce conforme a necessidade real aparece.
export { Search, Menu, LogOut, /* ... */ } from "lucide-react";
export type { LucideIcon } from "lucide-react";
```

```tsx
import { Search } from "@/theme/icons";
```

**Por que o barrel:** sem ele, cada arquivo escolhe o ícone que "parece
certo" na hora, e o mesmo conceito (ex.: "editar") acaba com 3 ícones
diferentes espalhados pelo projeto. Com o barrel, dá pra ver de relance todo
ícone em uso e reaproveitar o mesmo em vez de importar um novo parecido.

**Exemplo real** — item de navegação tipado (`shared/layout/navigation.ts`):

```ts
import { LayoutDashboard, type LucideIcon } from "@/theme/icons";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const SIDEBAR_SECTIONS: NavSection[] = [
  { title: "Principal", items: [{ href: "/dashboard", label: "Início", icon: LayoutDashboard }] },
];
```
