# Fundação, Autenticação e Formulários — base-front

Data: 2026-08-26
Status: aprovado (aguardando plano de implementação)

## Contexto

`base-front` é o projeto zero do padrão de front-end da empresa (ver
[`docs/CONTEXTO.md`](../CONTEXTO.md)). A referência de estrutura é
`~/Documents/projetos/next-locacao/front`, um Next.js App Router maduro e em
produção que usa: `app/` com route groups por área, `features/<feature>/{api,
hooks,schemas,components}`, `shared/{ui,layout,hooks,lib,forms,validation,
query,theme}`, `lib/{auth,api-client,constants,format}`. Stack lá: Tailwind +
MUI, React Query, React Hook Form + Zod, cliente de API gerado via
`@hey-api/openapi-ts` a partir de um backend Rails, autenticação por cookie
httpOnly setado por Route Handlers do Next.js.

O pedido foi trazer esse padrão pro `base-front`, mas só o essencial e
genérico — sem as partes específicas do negócio de aluguel (papéis
admin/gestor/locador, MUI, cliente gerado do Rails) — e sem fazer tudo de uma
vez. Este spec cobre as primeiras 3 fases de um roadmap maior (ver seção
"Roadmap completo"): **Fundação**, **Autenticação** e **Formulários**.

## Fora de escopo deste spec

- Papéis/permissões por área (`Fase 5` do roadmap).
- Design system / biblioteca de componentes (`Fase 6`).
- Cliente de API gerado (OpenAPI) — vem quando existir um backend real e a
  `Fase 4` for atacada. Por ora, chamadas autenticadas usam `fetch` cru via
  o proxy.
- Reestruturação do How to Dev (sidebar por padrão, página real "Padrão
  Frontend"). É um sub-projeto à parte, desenhado depois que este aqui gerar
  conteúdo real pra documentar.

## Decisões já fechadas

| Decisão | Escolha |
|---|---|
| UI | Só Tailwind v4 (o que o `create-next-app` já trouxe). Sem MUI. |
| Libs na Fundação | Só React Query (Provider global). RHF + Zod entram junto da Autenticação/Formulários. |
| Backend do auth | Proxy configurável via `API_URL` + modo fake local de fallback quando `API_URL` não está setada. |
| Papéis de usuário | Fora de escopo agora — Autenticação cobre só login/logout/sessão. |
| Guarda de sessão | Sem `middleware.ts`. Checagem de cookie no layout server-side (rápida) + fetch wrapper client-side que redireciona no primeiro 401 — mesmo modelo do next-locacao. |
| Nomenclatura | Português, igual ao projeto de referência (`autenticacao`, não `auth`). |

## Estrutura de pastas

```
base-front/
  src/
    app/
      layout.tsx                     # RootLayout: <html>, fonte, <QueryProvider>
      page.tsx                       # landing simples -> redireciona pra /login ou /inicio
      (auth)/
        login/
          page.tsx                   # renderiza <LoginForm />
      (protegido)/
        layout.tsx                   # server component: sem cookie -> redirect("/login")
        inicio/
          page.tsx                   # exemplo protegido: mostra usuário da sessão + botão sair
      api/
        auth/
          login/route.ts             # POST: valida credenciais (fake ou proxy), seta cookie
          logout/route.ts            # POST: limpa cookie (+ chama backend real se configurado)
          session/route.ts           # GET: devolve usuário atual (fake ou proxy) a partir do cookie
        proxy/
          [...path]/route.ts         # catch-all: injeta Authorization a partir do cookie, encaminha pra API_URL
    features/
      autenticacao/
        LoginForm.tsx                # client component, usa useLogin + FormField
        api/
          authApi.ts                 # loginRequest / logoutRequest (chamam as rotas /api/auth/*)
        hooks/
          useLogin.ts                # useForm + useMutation + redirect seguro pós-login
          useLogout.ts               # useMutation + limpa cache + redireciona
          useSession.ts              # useQuery sobre /api/auth/session
        schemas/
          login.schema.ts            # zod: email + senha
    shared/
      forms/
        FormField.tsx                # label + input + mensagem de erro (register do RHF)
      query/
        QueryProvider.tsx            # <QueryClientProvider>
        queryClient.ts               # createQueryClient()
      lib/
        http/
          apiFetch.ts                # fetch wrapper: JSON, trata 401 -> redireciona pro login
    lib/
      auth/
        constants.ts                 # AUTH_COOKIE_NAME
        session.ts                   # getAuthToken() / getServerAuthHeaders() (server-only)
        fakeAuth.ts                  # credencial demo, geração/validação do token fake
      routes.ts                      # ROUTES.login / ROUTES.home / redirectSeguro()
```

Diferenças deliberadas em relação ao next-locacao (justificativa curta cada
uma, pra não parecer esquecimento):

- `API_URL` sem prefixo `NEXT_PUBLIC_` — só é lida em Route Handlers
  (server), nunca no client, então não precisa (nem deveria) ser pública.
- Sem grupos `(admin)`/`(portal)` — vira só `(protegido)`, já que não há
  papéis ainda. Quando a Fase 5 chegar, provavelmente esse grupo se divide.
- Sem `app/api/proxy/rails/...` (era específico do Active Storage do Rails).

## Fluxo de Autenticação

**Login (`POST /api/auth/login`):**
1. Recebe `{ email, senha }`.
2. Se `API_URL` estiver setada: faz `POST` pro backend real (`${API_URL}/auth/login`, formato de payload a ajustar quando o backend existir), lê o token da resposta.
3. Se `API_URL` não estiver setada: compara com a credencial demo fixa (`lib/auth/fakeAuth.ts`) e gera um token fake (string fixa reconhecível, não é JWT de verdade).
4. Em caso de sucesso, seta cookie `auth_token` (httpOnly, `sameSite=strict`, `secure` em produção).
5. Erros de credencial voltam como `400`/`401` com mensagem amigável.

**Sessão (`GET /api/auth/session`):** lê o cookie; se ausente, `401`. Se
presente, valida (contra o backend real via proxy, ou localmente em modo
fake) e devolve `{ user: { nome, email } }`.

**Logout (`POST /api/auth/logout`):** limpa o cookie; se `API_URL`
configurada, tenta invalidar no backend (best-effort, não bloqueia o
logout se falhar — igual ao next-locacao).

**Proxy (`/api/proxy/[...path]`):** só existe/funciona com `API_URL`
configurada (em modo fake não há pra onde encaminhar); injeta
`Authorization: Bearer <token>` a partir do cookie e repassa a
resposta. Em `401` do backend, limpa os cookies de sessão.

**Guarda de sessão:**
- Server: `(protegido)/layout.tsx` só olha se o cookie `auth_token` existe
  (sem chamar a rede) — se não existir, `redirect("/login")`.
- Client: `shared/lib/http/apiFetch.ts` é o único ponto usado por hooks
  autenticados (`useSession`, e futuros hooks de dados); se a resposta vier
  `401`, faz `window.location.replace("/login?expirado=1")`.
- `useLogin` só aceita redirecionar pra um path relativo interno após o
  login (`redirectSeguro` em `lib/routes.ts`), pra evitar open redirect —
  mesma proteção do next-locacao, sem a parte de papel.

**Modo fake (documentado explicitamente na UI e no código):**
credencial demo `demo@empresa.com.br` / `demo123`. Existe só pra o fluxo
inteiro (login → sessão → área protegida → logout) funcionar de ponta a
ponta sem depender de nenhum backend. Trocar por um backend real é só
setar `API_URL` no `.env.local` — nenhuma outra mudança de código é
esperada nos componentes/hooks, só ajuste fino do formato de payload em
`login/route.ts` e `session/route.ts` se o backend real devolver um
formato diferente do assumido aqui.

## Formulários

`shared/forms/FormField.tsx`: componente controlado por `register` do React
Hook Form — recebe `label`, `error` (mensagem do zod resolver) e repassa o
resto das props pro `<input>`. Estilo Tailwind neutro (não copia a cor de
marca do next-locacao, já que o base-front ainda não tem identidade visual
própria definida).

Padrão documentado (pra qualquer formulário futuro seguir): schema Zod em
`schemas/*.schema.ts` → `zodResolver` no `useForm` → `useMutation` do React
Query pra submissão → erro de mutation exibido acima do botão de submit →
`FormField` pra cada campo. `LoginForm` é o primeiro exemplo real disso.

## Roadmap completo (arquivo `docs/ROADMAP.md`)

Documenta as 10 fases identificadas a partir do que o next-locacao realmente
usa (React Query, RHF+Zod, cliente de API, papéis, tema, shared/ui, testes),
cada uma com: objetivo, o que entra, o que fica de fora, status.

1. **Fundação** — pastas, layout raiz, Provider do React Query. `(implementando agora)`
2. **Autenticação** — login/logout/sessão, cookie httpOnly, proxy, guarda reativa. `(implementando agora)`
3. **Formulários** — RHF + Zod, `FormField`, convenção de validação/erro. `(implementando agora)`
4. **Camada de dados / API** — fetch autenticado reutilizável pra além do login; cliente OpenAPI gerado quando houver backend real. `(planejado)`
5. **Autorização e Papéis** — papel do usuário, áreas/rotas protegidas por papel. `(planejado)`
6. **Design system** — biblioteca de componentes Tailwind (botão, input, modal, tabela...). `(planejado)`
7. **Layout de aplicação** — shell autenticado (sidebar, topbar, breadcrumb). `(planejado)`
8. **Erros e estados** — error boundaries, loading/empty states, toasts. `(planejado)`
9. **Testes** — convenção de testes unitários/integração/e2e. `(planejado)`
10. **Qualidade e ferramentas** — lint/format/CI, convenção de commits. `(planejado)`

## Testagem

Depois de implementado: `pnpm dev`, testar manualmente o fluxo completo em
modo fake — acessar `/`, ser levado pro `/login`, entrar com a credencial
demo, cair em `/inicio` vendo o usuário da sessão, sair e voltar pro
`/login`; tentar acessar `/inicio` direto sem sessão e confirmar o redirect
server-side. `pnpm build` pra garantir que compila sem erro de tipo.

## Depois deste spec

Conforme cada fase for implementada e documentada, o mock do How to Dev (seção
"Padrão Frontend") é atualizado — troca de autor pra "Juan Kalleo" na parte
real, sidebar própria por padrão com "Autenticação" (e sub-itens
relacionados) e "Formulários" como itens de conteúdo, cada tecnologia com:
o quê, por quê, versão, como importar, exemplo de código copiável. Isso é um
spec à parte, desenhado depois que houver conteúdo real pra documentar.
