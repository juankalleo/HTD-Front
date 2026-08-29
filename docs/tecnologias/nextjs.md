# Next.js (App Router)

**O que é:** framework React que dá roteamento por pastas, server/client
components, e o servidor de dev/build do projeto inteiro.

**Por que essa:** é o padrão já usado nos outros projetos do monorepo
(`next-locacao`, `otica`, `How to Dev`) — manter o mesmo framework em todo
lugar significa que quem já trabalhou num projeto do grupo já sabe se virar
nos outros. App Router (não Pages Router) porque é o modelo atual do Next.js
e o que os projetos de referência já usam.

**Versão:** `16.3.3` (`package.json`).

**Como importar:** não se importa — é a base do projeto. Scaffold via
`pnpm create next-app`. Rotas são pastas dentro de `app/`; cada uma vira uma
URL pelo nome da pasta.

**Exemplo real** — grupo de rotas (o parêntese na pasta não entra na URL) e
`layout.tsx` de área protegida:

```tsx
// app/(dashboard)/layout.tsx
"use client";

import { AuthGuard } from "@/features/autenticacao/login/components/auth-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
```

```tsx
// app/(dashboard)/inicio/page.tsx — vira a rota /inicio
"use client";

export default function InicioPage() {
  return <div>...</div>;
}
```

Página que lê `useSearchParams()` precisa de um boundary de `<Suspense>` em
volta (ver `app/(auth)/login/page.tsx`), senão o build quebra.
