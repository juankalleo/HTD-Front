# Dados e API

> Documentação viva da Fase 4 do [`ROADMAP.md`](ROADMAP.md). Explica **onde
> cada coisa mora** e **por quê** — a pergunta mais comum de quem chega no
> projeto é "isso é `fetch` direto ou React Query? Vai em `services/` ou em
> `lib/`?". Este documento existe pra nunca precisar adivinhar.

## A regra de uma frase

**`fetch` só existe dentro de `services/*.ts`. Todo componente fala com dado
remoto através de um hook do React Query, nunca chamando `fetch` ou uma
função de `services/` direto.**

```
componente (.tsx)
   │  usa
   ▼
hook (useQuery / useMutation)         ← features/<feature>/hooks/ ou shared/hooks/
   │  chama
   ▼
função de services/*.ts (fetch puro) ← nenhum React aqui dentro
   │  HTTP
   ▼
Rails api/
```

Por quê: cache, invalidação, estado de loading/error e retry já vêm de
graça do React Query — reimplementar isso com `useState`/`useEffect` em
cada componente é exatamente o problema que a lib resolve (ver
[`tecnologias/react-query.md`](tecnologias/react-query.md)). Deixar `fetch`
isolado em `services/` também é o que permite trocar de biblioteca de
data-fetching no futuro sem tocar em componente nenhum.

## `services/` — só `fetch`, zero React

Cada arquivo fala com **uma fatia coerente do contrato do backend**, não
com "um recurso": `services/api-admin.ts` é genérico pra qualquer
`/api/v1/admin/<recurso>` (todo recurso nasce do mesmo gerador Rails, ver
`api/CLAUDE.md`), enquanto `api-identity.ts` e `api-institucional.ts` são
específicos porque `/auth/*` e `/c_configuracoes/*` têm formato próprio
(token no header, endpoint público sem sessão, `FormData` em vez de JSON).

| Arquivo | Fala com | Particularidade |
|---|---|---|
| `services/api-admin.ts` | `/api/v1/admin/*` (qualquer recurso) | Genérico: `adminList/Get/Create/Update/Delete` recebem o nome do recurso como string |
| `services/api-identity.ts` | `/api/v1/auth/*` | Modo fake sem `NEXT_PUBLIC_API_URL`; token vem no **header**, não no body |
| `services/api-institucional.ts` | `/api/v1/c_configuracoes/*` | `atual` é público (sem token); `update` manda `FormData` (upload de imagem), não JSON |

Toda função de `services/` segue o mesmo formato de retorno/erro:
devolve o `data` já desembrulhado do envelope `{status, message, data}` do
Rails, e lança uma classe de erro própria (`AdminApiError`,
`ConfiguracaoInstitucionalApiError`) com `.message` pronto pra mostrar num
toast e `.status` pro código HTTP.

```ts
// services/api-admin.ts — genérico, qualquer recurso admin
export function adminList<T>(resource: string, params?: {...}): Promise<PagedResult<T>> {
  return request<PagedResult<T>>(`/api/v1/admin/${resource}${queryString(params)}`);
}
export function adminCreate<T>(resource: string, body: Record<string, unknown>): Promise<T> { ... }
export function adminUpdate<T>(resource: string, id, body): Promise<T> { ... }
export function adminDelete(resource: string, id): Promise<void> { ... }
```

## `shared/hooks/use-admin-resource.ts` — a ponte genérica

Todo recurso admin (`usuarios`, `papéis`, `tipos de usuário`, `permissões`,
`configuração institucional`, `referenciais`) tem o mesmíssimo shape de CRUD
porque nasce do mesmo `bin/rails g api_scaffold` do lado da API. Em vez de escrever
`useQuery`/`useMutation` na mão em cada feature, `use-admin-resource.ts`
oferece 5 hooks genéricos por cima de `services/api-admin.ts`:

```ts
useAdminList<T>(resource, params, queryKey)   // useQuery — lista paginada
useAdminGet<T>(resource, id, queryKey)        // useQuery — um registro
useAdminCreate<T>(resource, invalidateKeys, entidade)  // useMutation + toast + invalidate
useAdminUpdate<T>(resource, invalidateKeys, entidade)  // idem, PATCH
useAdminDelete(resource, invalidateKeys, entidade)     // idem, DELETE
```

`useAdminCreate`/`Update`/`Delete` já disparam o toast de sucesso/erro
(`shared/ui/sistema/toast.tsx`, exportado por `@/shared/ui`) e invalidam as query keys passadas — nenhuma feature
repete essa lógica.

## Hooks por feature — a camada de domínio

Cada `features/<domínio>/<feature>/hooks/` chama os hooks genéricos acima,
já resolvendo o nome do recurso Rails, o corpo esperado (`{a_papel: {...}}`)
e a query key:

```ts
// features/admin/tipos-usuario/hooks/use-create-tipo-usuario.ts
export function useCreateTipoUsuario() {
  const mutation = useAdminCreate<ATipoUsuario>("a_tipos_usuario", [tiposUsuarioKeys.all], "Tipo de usuário");
  function createTipoUsuario(valores: TipoUsuarioFormValues) {
    return mutation.mutateAsync({ a_tipo_usuario: valores });
  }
  return { createTipoUsuario, ...mutation };
}
```

Regra de nomenclatura: um hook por operação (`use-<verbo>-<entidade>.ts`),
nunca um hook "canivete suíço" que decide internamente se cria ou atualiza —
essa decisão fica no componente de formulário (`if (registro) update; else
create`).

**Quando vários recursos têm o mesmo comportamento** (caso de
[`REFERENCIAIS.md`](REFERENCIAIS.md): país, estado, município, tenant, órgão,
tipo de unidade e unidade), o padrão é um módulo com config por recurso, não
sete cópias de CRUD. A config declara `resource`, `bodyKey`, campos, colunas e
filtros; o hook genérico chama `useAdminList/Get/Create/Update/Delete`.

**Quando um recurso precisa de dois formatos** (lista paginada pra tela de
listagem × lista completa pra dropdown, caso de `a_tipos_usuario`): dois
hooks, nomes diferentes, mesma `services/api-admin.ts` por trás —
`useTiposUsuario()` (sem paginação, pro `<select>` do formulário de usuário)
e `useTiposUsuarioPaginado(page, busca)` (pra tela `/tipos-usuario`). Nunca
mude o hook existente pra "fazer as duas coisas" — quebra quem já depende
dele.

## `types/`, `schemas/`, `constants/` — o resto da pasta de uma feature

Toda feature de admin segue a mesma forma:

```
features/admin/<feature>/
  types/index.ts        # o shape que a API devolve (espelha o serializer Rails)
  constants/query-keys.ts  # as query keys do React Query, centralizadas
  schemas/<algo>.schema.ts # validação Zod do formulário (ver FORMULARIOS.md)
  hooks/use-<algo>.ts      # um arquivo por hook (list/get/create/update/delete)
  components/<algo>-form.tsx, <algo>-list.tsx
```

- **`types/`** nunca inventa campo — espelha literalmente o
  `*_serializer.rb` do lado da API (comentário no topo do arquivo aponta o
  serializer real). Se o serializer não devolve `email`, o type do front
  também não tem `email`.
- **`constants/query-keys.ts`** é a fonte única de verdade da query key —
  tanto o hook de leitura quanto o de mutação (`invalidateKeys`) importam
  daqui, nunca escrevem o array na mão duas vezes.
- **`schemas/`** valida só o que o backend também valida — nunca uma regra
  mais forte "pra garantir" (ex.: `nome` não ganha `min(2)` se o model Rails
  só exige presence). Ver [`FORMULARIOS.md`](FORMULARIOS.md).

## `lib/` — utilitário puro, sem fetch e sem componente

`lib/` é pra função pura (input → output, sem `useState`, sem `fetch`, sem
JSX). Se a função precisa de rede, é `services/`; se precisa de React, é um
hook ou componente.

| Arquivo | Faz |
|---|---|
| `lib/auth.ts` | Lê/grava token e usuário no `localStorage` (`getAccessToken`, `storeUser`, `clearStoredSession`) |
| `lib/routes.ts` | Constantes de rota + `redirectSeguro()` (bloqueia open redirect em `?redirect=`) |
| `lib/error-utils.ts` | `extrairMensagem(payload, fallback)` — lê `.message` de um erro da API sem assumir o shape inteiro |
| `lib/cn.ts` | `cn()` — className condicional (ver [`tecnologias/clsx-tailwind-merge.md`](tecnologias/clsx-tailwind-merge.md)) |
| `lib/avatar.ts` | `getInitials`/`getAvatarColors` — iniciais e cor estável a partir de um nome, pro avatar do topbar |
| `lib/ransack.ts` | `sortingParaRansack()` — traduz sort do TanStack Table para `q[s]` |

`lib/auth.ts` e `lib/error-utils.ts` são consumidos só por `services/*.ts`
(nunca por componente direto) — são o "sub-nível" que a camada de `services`
usa pra montar o header `Authorization` e ler mensagem de erro do envelope.
`lib/cn.ts` e `lib/avatar.ts` já são consumidos por componente direto, por
serem puramente de apresentação.

### O que foi revisado da `otica/front/src/lib` e não foi trazido

Ao portar `cn()`/`avatar` de lá, a pasta inteira foi revisada pastinha por
pastinha — registrado aqui pra não repetir a pergunta depois:

- `format/`, `formatters/` (moeda BRL, data, máscara de CPF/telefone) — a
  própria `otica` já tem essas duas pastas fazendo a mesma coisa
  (duplicação nunca resolvida lá). Não trazido: `base-front` ainda não tem
  nenhum campo de dinheiro/data/CPF pra formatar (é fundação, o primeiro
  módulo de domínio real ainda não existe) — trazer agora seria código sem
  chamador, e exigiria a dependência `date-fns` sem caso de uso.
- `format/venda-status.ts` — específico do domínio de vendas da ótica, não
  se aplica.
- `constants/sidebar-storage.ts` — chave de localStorage pra sidebar
  **colapsável**. `base-front` tem sidebar com largura ajustável (arrastar,
  ver [`LAYOUT-DA-APLICACAO.md`](LAYOUT-DA-APLICACAO.md)), não colapsável —
  funcionalidade diferente, não pedida.
- `auth.ts`, `error-utils.ts`, `session-user.ts` da otica — têm campo/fluxo
  que não existe no backend real deste monorepo (refresh token,
  `papel`/`ativo`/`primeiro_acesso` no `User`). O `base-front` já tem sua
  própria versão desses três, desenhada em cima do contrato real da `api/`
  — ver [`AUTENTICACAO.md`](AUTENTICACAO.md).
