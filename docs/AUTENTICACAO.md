# Autenticação — como funciona

> Documentação viva da Fase 2 do [`ROADMAP.md`](ROADMAP.md). Atualiza junto
> do código. Isso é o que vira conteúdo real na seção "Padrão Frontend" do
> How to Dev.

## Visão geral

Cinco fluxos, cada um isolado em `features/autenticacao/<fluxo>/`:

| Fluxo | Rota | Backend real? |
|---|---|---|
| `login` | `/login` | Sim — `POST /api/v1/auth/sign_in` |
| `logout` | (ação, sem rota própria) | Sim — `DELETE /api/v1/auth/sign_out` |
| `esqueci-senha` | `/esqueci-senha` | Não — ver "Fluxos sem backend" |
| `alterar-senha` | `/alterar-senha` | Não — ver "Fluxos sem backend" |
| `primeiro-acesso` | `/primeiro-acesso` | Não — ver "Fluxos sem backend" |

Regra de organização: **nada solto direto em `features/autenticacao/`** —
tudo mora dentro da pasta do fluxo dono (`components/`, `hooks/`,
`schemas/`, `constants/`, `types/` conforme o fluxo precisar). `AuthGuard` e
`useSession` moram dentro de `login/` porque são resultado direto do login
(sessão), não um fluxo à parte.

## Arquitetura

**Token em `localStorage`, chamada direta do browser pro backend Rails —
sem Route Handler do Next.js no meio.** Essa foi uma decisão revista: a
primeira versão usava cookie httpOnly + proxy Next.js (padrão do
next-locacao); foi trocada pelo padrão da otica (token client-side,
`services/api-identity.ts` chama o Rails direto). Detalhe completo da
mudança em [`ROADMAP.md`](ROADMAP.md#decisão-revista-sem-route-handler--proxy-nextjs).

Implicação real, não teórica: o backend `api/` deste monorepo tem CORS
**desativado** por padrão (`config/initializers/cors.rb` comentado). Pra
`NEXT_PUBLIC_API_URL` apontar pra ele e funcionar de verdade no browser,
alguém precisa habilitar CORS lá, com `expose_headers: ["Authorization"]` —
o token do `sign_in` vem no **header** da resposta, não no body, e um
`fetch` cross-origin não lê esse header de volta sem isso.

```
Browser (services/api-identity.ts)
   │  fetch direto, sem proxy
   ▼
Rails api/  →  POST /api/v1/auth/sign_in
   │  header Authorization: Bearer <token>
   │  body { status, message, data: { id, nome, email, a_tipo_usuario } }
   ▼
lib/auth.ts  →  localStorage: access_token + user
```

## Modo fake vs backend real

Controlado por uma env var só: `NEXT_PUBLIC_API_URL`.

- **Ausente** (padrão local, sem nada configurado): `services/api-identity.ts`
  roda em modo fake. Credencial fixa `demo@empresa.com.br` / `demo123`
  (definida em `features/autenticacao/login/constants/index.ts`), token fake
  fixo. Dá pra testar o fluxo inteiro (login → sessão → área protegida →
  logout) sem nenhum backend rodando.
- **Presente**: toda chamada vai de verdade pro Rails em `NEXT_PUBLIC_API_URL`.
- **Trava de produção**: se `NODE_ENV === "production"` e `NEXT_PUBLIC_API_URL`
  não estiver setada, `signIn`/`fetchCurrentUser` **lançam erro** em vez de
  cair no modo fake — a credencial demo fica documentada publicamente na
  wiki, não pode ficar funcionando num deploy de verdade por esquecimento.

## Os fluxos com backend real

### Login (`features/autenticacao/login/`)

`login-form.tsx` → `use-login-form.ts` (React Hook Form + Zod, `useMutation`
do React Query) → `signIn()` em `services/api-identity.ts`.

Sucesso: guarda token (`localStorage`), guarda o usuário devolvido no body
do `sign_in` (`lib/auth.ts#storeUser`), mostra toast de boas-vindas, e
redireciona — via `redirectSeguro()` (`lib/routes.ts`), que só aceita um
`?redirect=` interno (evita open redirect).

Erro: toast de erro + `form.setError("password", { message: " " })` (marca
o campo como inválido sem repetir a mensagem, que já foi pro toast).

### Sessão (`login/hooks/use-session.ts`)

`useQuery` sobre `fetchCurrentUser()` (`GET /api/v1/auth/me`).
`staleTime` de 5 minutos — login/logout fazem `queryClient.clear()`, então
troca de usuário nunca serve cache velho.

### AuthGuard (`login/components/auth-guard.tsx`)

Envolve `app/(dashboard)/layout.tsx`. Como o token vive em `localStorage`
(não em cookie), a checagem só pode ser client-side: o componente renderiza
um spinner até confirmar que existe token, senão redireciona pro `/login`.
Isso é o **único** ponto de guarda hoje — se o token existir mas for
inválido/expirado, quem detecta é a reação a um `401` (ver abaixo), não o
`AuthGuard`.

### Logout (`features/autenticacao/logout/`)

`use-logout.ts` → `signOut()` (best-effort: falha do backend não trava o
logout local) → limpa `localStorage` e `queryClient`, `window.location.replace`
pro login (recarga dura, evita voltar pra tela logada pelo botão voltar).

### Reação a 401 fora do login

`services/api-identity.ts#fetchCurrentUser` (e qualquer chamada autenticada
futura no mesmo padrão) limpa a sessão e redireciona pro
`/login?expirado=1` se o backend responder `401` — sessão expirada/revogada
no meio do uso, não só na primeira carga.

## Fluxos sem backend (`esqueci-senha`, `alterar-senha`, `primeiro-acesso`)

UI, validação (Zod) e o fluxo de formulário estão prontos e funcionam de
verdade no client. O que **não** funciona: o envio real, porque o backend
`api/` não expõe:
- recuperação de senha (`skip: [..., :passwords, ...]` desativa o módulo
  `:passwords` do Devise em `config/routes.rb`);
- nenhuma flag de "primeiro acesso" no `User`.

`services/api-identity.ts` tem `requestPasswordReset`, `resetPassword` e
`completeFirstAccess` — cada uma sempre devolve
`{ ok: false, status: 501, message: "... ainda não está disponível" }`,
com um comentário documentando o endpoint esperado (método, path, body) pra
quando o backend ganhar essa capacidade. Nenhuma finge sucesso.

## Gaps conhecidos (dependem do backend `api/`)

- **Refresh token** — devise-jwt aqui só revoga (`JTIMatcher`), não tem
  endpoint de refresh. Sem isso, sessão expirada = login de novo, sem
  renovação silenciosa.
- **Primeiro acesso detectado no login** — não implementado por não ter
  como testar contra um endpoint real (ver "Fluxos sem backend").

## Testar localmente (modo fake, sem backend)

```bash
pnpm dev
```

- `/login` com `demo@empresa.com.br` / `demo123` → `/inicio`.
- `/inicio` mostra o usuário da sessão e tem botão "Sair".
- Acessar `/inicio` direto sem login → `AuthGuard` manda pro `/login`.
- `/esqueci-senha`, `/alterar-senha`, `/primeiro-acesso` renderizam e
  validam, mas o submit sempre volta "ainda não está disponível" (esperado).

## Ligar num backend real

1. Setar `NEXT_PUBLIC_API_URL` (ex.: `.env.local`) apontando pro Rails
   `api/` rodando.
2. Habilitar CORS no Rails (`config/initializers/cors.rb`), incluindo
   `expose_headers: ["Authorization"]`.
3. Pronto para login/logout/sessão — nenhum componente muda.
