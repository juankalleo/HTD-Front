# TanStack React Query

**O que é:** biblioteca de estado assíncrono — busca, cacheia, invalida e
sincroniza dados de servidor (aqui: sessão do usuário) sem precisar de
`useState`/`useEffect` manual.

**Por que essa:** mesma escolha do `next-locacao` e da `otica` — os dois
projetos de referência já usam React Query pra tudo que é dado assíncrono.
Manter a mesma lib evita ter duas formas diferentes de buscar/cachear dado
entre projetos do grupo. Entrou já na Fase 1 (Fundação) porque o Provider é
estrutural — envolve o app inteiro, mesmo antes de a Autenticação existir.

**Versão:** `^5.102.5` (`package.json`).

**Como importar:**

```bash
pnpm add @tanstack/react-query
```

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
```

**Exemplo real** — Provider global (`shared/query/`):

```tsx
// shared/query/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 2 * 60 * 1000 } },
  });
}
```

```tsx
// shared/query/query-provider.tsx
"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "./query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

Uso real — sessão do usuário logado (`features/autenticacao/login/hooks/use-session.ts`):

```ts
export function useSession() {
  const query = useQuery({
    queryKey: ["auth", "session"],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { user: query.data, isLoading: query.isLoading, isError: query.isError };
}
```

Convenção do projeto: toda submissão de formulário usa `useMutation` (ver
`use-login-form.ts`), nunca `fetch` direto dentro do componente.
