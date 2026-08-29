# Segurança do frontend — 10 conceitos de proteção

> Levantamento de 10 conceitos de proteção/segurança padrão (XSS, CSP,
> CSRF, cookies HttpOnly/Secure, SRI, clickjacking, cabeçalhos de
> segurança HTTP, sanitização de inputs, poluição de protótipo, MitM)
> contra o estado real do `base-front`, seguindo o mesmo formato de
> [`CONCEITOS-FRONTEND.md`](CONCEITOS-FRONTEND.md): o que já existe, o que
> não se aplica (e por quê), e o que foi implementado agora — CSP +
> cabeçalhos de segurança, o gap real fechado nesta fase.

## 1. XSS — já coberto, estrutural

React escapa automaticamente todo `{valor}` interpolado em JSX — é a
defesa primária, cobre 100% do projeto sem exceção manual por componente.
`dangerouslySetInnerHTML` só aparece uma vez (`THEME_SCRIPT` em
`app/layout.tsx`), string estática sem interpolação de dado dinâmico.
Exportação de PDF (única superfície que monta HTML a partir de string
concatenada) já tinha `escapeHtml`/`valorHtml`, testado com payload real
(Fase 17). CSP (item 2) entra como camada extra, não substituindo o escape
do React.

## 2. CSP — implementado nesta fase

**Achado real:** `next.config.ts` estava vazio, sem `middleware.ts` —
zero Content-Security-Policy, já flagueado como limite conhecido em
`MEDIDAS-DE-SEGURANCA.md` (mirror How to Dev) antes mesmo desta fase.

Corrigido com `middleware.ts` novo, gerando nonce por requisição
(`crypto.randomUUID()`) e montando o CSP:

```ts
const csp = [
  "default-src 'self'",
  `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data:${apiOrigin ? ` ${apiOrigin}` : ""}`,
  "font-src 'self'",
  `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");
```

Nonce repassado via header de requisição (`x-nonce`) pra
`app/layout.tsx` ler com `headers()` e aplicar no único script inline:

```tsx
const nonce = (await headers()).get("x-nonce") ?? undefined;
<script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
```

Decisões que exigiram investigação real antes de escrever a diretiva (não
copiadas de um exemplo genérico):

- `style-src 'unsafe-inline'` — obrigatório: `APARENCIA-AVANCADA.md`
  (Fase 16) depende de `style` inline via prop do React em vários pontos
  (cor de sidebar, tamanho de fonte). Sem essa exceção, o tema
  institucional configurável quebraria inteiro.
- `img-src`/`connect-src` incluem `apiOrigin` (derivado de
  `NEXT_PUBLIC_API_URL` em runtime, dentro do próprio middleware) — sem
  isso, o fetch direto à API Rails (decisão da Fase 2, sem proxy) e o
  `<img>` do ícone/fundo institucional (Fase 11) seriam bloqueados pelo
  próprio CSP.
- `'strict-dynamic'` no `script-src` — necessário por causa do
  `next/dynamic` já em uso (Fase 20, `ImageCropperModal`): sem isso, o
  chunk carregado sob demanda não teria como ser confiado sem listar cada
  chunk manualmente.
- `'unsafe-eval'` só em `NODE_ENV=development` — Fast Refresh do Next usa
  `eval`; build de produção não carrega essa exceção.
- Verificado que o Next.js propaga o nonce sozinho pros próprios
  `<script>`/`<link rel="stylesheet">` que ele injeta (comportamento
  nativo do framework, confirmado inspecionando o HTML gerado, não só
  assumido pela documentação).

`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
`Strict-Transport-Security`, `Permissions-Policy` entraram junto, estático,
em `next.config.ts` (não precisam de nonce por requisição, diferente do
CSP).

**Verificado ao vivo** contra o dev server rodando (não só lido no
código) — `curl -D -` confirmou todos os headers presentes, incluindo CSP
com nonce real, `img-src`/`connect-src` corretos com
`http://localhost:3001` (o `NEXT_PUBLIC_API_URL` configurado), e o
`<script nonce="...">` do tema batendo com o nonce do header. Página de
login carrega normalmente (200, conteúdo real renderizado) — sem quebra
visível de CSP.

## 3. CSRF — não se aplica

Token JWT em `localStorage`, anexado manualmente via header
`Authorization: Bearer` em cada `fetch` (`services/*`) — nunca cookie.
CSRF explora o navegador anexando cookie automaticamente numa requisição
cross-site forjada; sem cookie de auth, não existe o que forjar. Trade-off
já documentado (`MEDIDAS-DE-SEGURANCA.md`): token em `localStorage` é
legível por XSS — por isso XSS (item 1) importa mais que CSRF nesse
desenho.

## 4. Cookies HttpOnly & Secure — não se aplica

Grep confirma: zero `document.cookie`, zero lib de cookie, zero
`cookies()` do Next em qualquer rota do projeto. Nada a proteger porque
não existe cookie.

## 5. SRI — não se aplica

Zero `<script src="https://...">` externo em todo o projeto (grep
confirma) — o único `<script>` é inline e local. Fontes via
`next/font/google`, self-hosted no build (zero request runtime pra CDN de
fonte).

## 6. Clickjacking — implementado nesta fase

Coberto pelas mesmas duas camadas do item 2: `frame-ancestors 'none'`
(CSP) + `X-Frame-Options: DENY` (`next.config.ts`, fallback pra navegador
sem CSP nível 3). `DENY`/`'none'` porque não existe caso legítimo de
embutir este admin panel em iframe de terceiro.

## 7. Cabeçalhos de segurança HTTP — implementado nesta fase

Ver item 2 — é o mesmo trabalho, cabeçalho por cabeçalho:
`X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, `Strict-Transport-Security` (2 anos,
subdomínios), `Permissions-Policy` negando câmera/microfone/geolocalização
(nenhuma tela usa).

## 8. Sanitização de inputs — já coberto

Entrada: Zod em todo formulário (Fase 3/19), nunca mais forte que o
backend. Saída: escape automático do React (item 1) + `escapeHtml`/
`valorCelulaSegura` nas exportações (Fases 17/18) — cobertura dupla,
entrada e saída, sem gap novo encontrado.

## 9. Poluição de protótipo — não se aplica

Verificado: nenhuma lib de merge profundo instalada
(`lodash.merge`/`deepmerge`/etc.), nenhum `Object.assign`/spread
recursivo de JSON externo em objeto compartilhado. Único `JSON.parse`
relevante é `lib/auth.ts#getStoredUser`, resultado isolado numa variável
tipada, nunca mesclado em objeto global. Sem o padrão de código que abre
essa classe de vulnerabilidade, não há o que corrigir — documentado como
"quando importaria" (se uma lib de merge entrar no futuro, cuidado com
`__proto__`/`constructor`/`prototype`).

## 10. Man-in-the-Middle — implementado nesta fase (parcial, por natureza)

`Strict-Transport-Security` (item 2/7) é a parte que um frontend web
consegue controlar — sem efeito sobre HTTP puro (dev), só passa a valer
atrás de HTTPS real em produção. `upgrade-insecure-requests` (diretiva do
CSP) reforça numa camada diferente. Certificate pinning **não tem
equivalente possível** num navegador comum (é técnica de app
mobile/nativo, sem API acessível a JavaScript de página) — documentado
como limite estrutural da plataforma web, não como gap deste projeto.

## Resumo

| # | Conceito | Status |
|---|---|---|
| 1 | XSS | Já coberto (escape do React + `escapeHtml` no PDF) |
| 2 | CSP | **Implementado nesta fase** (`middleware.ts`, nonce por request) |
| 3 | CSRF | Não se aplica (token em header, não cookie) |
| 4 | Cookies HttpOnly/Secure | Não se aplica (zero cookie no projeto) |
| 5 | SRI | Não se aplica (zero script/CDN externo) |
| 6 | Clickjacking | **Implementado nesta fase** (`frame-ancestors` + `X-Frame-Options`) |
| 7 | Cabeçalhos de segurança HTTP | **Implementado nesta fase** (`next.config.ts`) |
| 8 | Sanitização de inputs | Já coberto (Zod na entrada + escape na saída) |
| 9 | Poluição de protótipo | Não se aplica (zero merge profundo no projeto) |
| 10 | Man-in-the-Middle | **Implementado nesta fase** (HSTS); cert pinning não existe pra web |

Detalhe por conceito, com o mesmo conteúdo em prosa (mas sem o histórico
de "achado/corrigido" — lá é padrão de referência, aqui é log de fase),
mirror em How to Dev: `docs-frontend/seguranca/{XSS,CSP,CSRF,
COOKIES-HTTPONLY-SECURE,SRI,CLICKJACKING,CABECALHOS-DE-SEGURANCA-HTTP,
SANITIZACAO-DE-INPUTS,POLUICAO-DE-PROTOTIPO,MITM}.md`.
