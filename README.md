# HTD Front

Referência pessoal de estrutura de frontend em Next.js — mantida por
**Juan Kalleo** como o "ponto zero" prático de um padrão: App Router,
TypeScript, Tailwind v4, TanStack Query, React Hook Form + Zod. É onde as
decisões de pasta, camada e convenção são tomadas construindo de verdade,
não definidas antes no vácuo.

A documentação completa de cada decisão (o quê, o porquê, a versão, exemplo
de código) mora em [`docs/`](docs/) e, em paralelo, no projeto irmão
**How to Dev** (site de documentação dos padrões — frontend, API,
infraestrutura e exemplos).

## Stack

- **Next.js 16** (App Router, Turbopack, Server Components por padrão)
- **TypeScript**
- **Tailwind v4**
- **TanStack Query** — cache e estado de servidor
- **React Hook Form + Zod** — formulário e validação
- **Vitest + Testing Library** — testes

## Estrutura

```text
app/        rotas, layouts e composição de tela (route groups por área)
features/   regra de produto, uma pasta por feature (components/hooks/schemas)
shared/     ui, layout, hooks, forms e query realmente reutilizáveis
services/   client HTTP por domínio (fetch genérico + endpoints específicos)
lib/        auth, formatação, rotas e utilidades de servidor
docs/       documentação real de cada padrão implementado
```

Ver [`docs/CONTEXTO.md`](docs/CONTEXTO.md) para o histórico completo de
decisões e [`docs/ROADMAP.md`](docs/ROADMAP.md) para o que já foi
implementado e o que vem a seguir.

## Rodando localmente

```bash
corepack pnpm install
corepack pnpm run dev
```

Copie `.env.local` (ou configure `NEXT_PUBLIC_API_URL`) apontando para a
API que este front consome — o projeto não inclui backend.

## Segurança

Headers HTTP (CSP com nonce por requisição, `X-Frame-Options`,
`X-Content-Type-Options`, HSTS, `Permissions-Policy`) são aplicados em
`proxy.ts`/`next.config.ts`. Detalhes e motivo de cada um em
[`docs/SEGURANCA-FRONTEND.md`](docs/SEGURANCA-FRONTEND.md).

## Licença

Projeto pessoal, sem licença de uso definida.
