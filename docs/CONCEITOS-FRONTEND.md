# Conceitos técnicos de frontend — auditoria e fechamento de gaps

> Levantamento de 14 conceitos técnicos padrão de frontend (pedido direto,
> 27/08/2026) contra o estado real do `base-front` — não uma lista de
> features novas, e sim uma auditoria: o que já existe (com código real
> citado), o que foi resolvido de outro jeito (e por quê isso é legítimo,
> não um gap disfarçado), o que não se aplica a este projeto especificamente
> (auditado internamente, atrás de login, sem página pública), e os dois
> gaps reais fechados nesta fase (code splitting + acessibilidade do único
> `<dialog>` nativo do projeto). Cada item tem uma conclusão, não só uma
> definição.

## 1. CORS

**Status: já existe, gap real já documentado — nada novo aqui.**

`api/config/initializers/cors.rb` libera CORS só em `Rails.env.development?`,
pros hosts `localhost`/`127.0.0.1`, com `expose_headers: ["Authorization"]`
(o `devise-jwt` devolve o token no header da resposta de login, não no
corpo — sem isso o `fetch` do browser não consegue ler o header numa
resposta cross-origin). Produção **não tem CORS configurado** — decisão e
implicação já registradas em
[`AUTENTICACAO.md`](AUTENTICACAO.md#implicação-real-não-teórica-o-backend-api-deste-monorepo-tem-cors)
e [`ROADMAP.md`](ROADMAP.md#decisão-revista-sem-route-handler--proxy-nextjs).
Item de infraestrutura de deploy, não de código do front — nada a
implementar aqui além do que já está escrito.

## 2. Debounce & Throttle

**Status: debounce já implementado; throttle não tem caso de uso no projeto.**

`shared/ui/filtros/search-input.tsx` já debounça a digitação (350ms,
`setTimeout` + estado local `rascunho`, documentado no próprio arquivo)
antes de refletir no filtro real e disparar a query. É o único input de
texto que dispara busca a cada tecla — os demais filtros são `<select>`
(sem debounce, disparo é por `onChange` discreto, não por digitação).

Throttle serve pra limitar eventos de alta frequência (scroll, resize,
mousemove). Não existe hoje nenhum handler desses no projeto (grep
confirma: zero `onScroll`/`onResize`/listener de `scroll`/`resize`) — não
tem o que throttlear. Se aparecer (por exemplo, um scroll infinito ou um
gráfico redesenhado no resize), o padrão a seguir é o mesmo do
`SearchInput`: estado local + `setTimeout`, sem trazer lib nova
(`lodash.throttle` etc.) pra um caso só.

## 3. Virtual Scrolling

**Status: resolvido de outro jeito — paginação no servidor, não virtualização no client.**

Virtual scrolling existe pra renderizar só os itens visíveis de uma lista
**longa carregada inteira no client**. Isso nunca acontece aqui: toda
listagem admin usa paginação real do servidor (Pagy, na `api/`) — o client
nunca tem em mãos mais que uma página de linhas por vez, então não existe
lista longa pra virtualizar. Nenhuma lib de virtualização
(`react-window`/`@tanstack/react-virtual`) está instalada.

**Exceção que não é exceção:** a exportação de relatório (PDF/Excel, ver
[`SEGURANCA-EXPORTACAO.md`](SEGURANCA-EXPORTACAO.md)) busca o conjunto
filtrado **inteiro**, sem paginar — mas nunca renderiza isso como DOM, só
serializa direto pro arquivo de saída (template do Puppeteer ou planilha do
ExcelJS). Não é uma lista na tela, então virtual scrolling não se aplica
nem aí.

## 4. Hydration

**Status: já tratado, um único ponto, justificado.**

`suppressHydrationWarning` aparece exatamente uma vez no projeto inteiro —
`app/layout.tsx`, na tag `<html>`:

```tsx
<html lang="pt-BR" data-theme={config.tema} style={{ /* ... */ }} suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
  </head>
```

`THEME_SCRIPT` roda antes da hidratação pra evitar flash de tema errado
(lê preferência local, ajusta `data-theme` no HTML cru antes do React
assumir) — o mesmo motivo clássico documentado por toda lib de dark mode.
`suppressHydrationWarning` só silencia o aviso **desse nó específico**
(não propaga pros filhos), então não esconde divergência real de hidratação
em nenhum outro componente da árvore.

## 5. Code Splitting

**Status: gap real fechado nesta fase.**

Next.js já faz code splitting automático por rota — cada `page.tsx` só
carrega o que a própria rota importa. Isso já isolava dependências pesadas
como `echarts` (só entra no bundle de `/relatorios/*`) sem nenhuma
configuração manual. O que faltava era um caso **dentro** de uma rota:
`ImageCropperModal` (`shared/ui/sistema/image-cropper-modal.tsx`) empacota
`react-easy-crop` inteiro, mas só é usado quando alguém efetivamente escolhe
um arquivo em Identidade institucional — a maioria das visitas àquela tela
nunca troca de imagem, e ainda assim pagava o bundle de `react-easy-crop`
no carregamento inicial da página.

**Achado real (27/08/2026), corrigido:**
`features/admin/config-institucional/components/identidade-form.tsx`
importava `ImageCropperModal` estático do barrel `@/shared/ui`. Trocado por
`next/dynamic`, direto do arquivo (não do barrel, pra garantir que o
bundler consiga isolar o chunk):

```tsx
import dynamic from "next/dynamic";

const ImageCropperModal = dynamic(
  () => import("@/shared/ui/sistema/image-cropper-modal").then((modulo) => modulo.ImageCropperModal),
  { ssr: false },
);
```

`ssr: false` porque o componente já só faz sentido no client (usa
`document.body`/`createPortal`, `URL.createObjectURL`) — sem isso o Next
tentaria renderizá-lo no servidor à toa. Padrão a repetir: qualquer
componente client-only, pesado e condicional (só aparece atrás de uma
interação, não no primeiro paint da tela) é candidato a `next/dynamic`;
componente sempre visível na tela não ganha nada com isso (só adiciona uma
etapa de carregamento sem necessidade).

## 6. Tree Shaking

**Status: já correto, sem configuração extra necessária.**

`theme/icons.tsx` é o único ponto de entrada de ícones do projeto
(`lucide-react`) e reexporta só o que já está em uso em algum componente —
nada especulativo, cresce sob demanda real:

```ts
// theme/icons.tsx
export {
  AlertCircle,
  ArrowDown,
  // ...só os que algum componente do projeto realmente usa
} from "lucide-react";
```

Exports nomeados (não `export *` de um módulo cheio, não `import` default
de um objeto gigante) são o que permite o bundler (Turbopack, aqui) cortar
o resto de `lucide-react` do bundle final. Next.js/Turbopack já fazem tree
shaking por padrão em cima disso — nada em `next.config.ts` precisa mexer
nisso pra funcionar.

## 7. Server-Side Rendering (SSR)

**Status: já é o padrão do projeto, não uma adição.**

Next.js App Router renderiza no servidor por padrão — todo componente é
Server Component a menos que declare `"use client"`. Contagem real em
`app/` (27/08/2026): **29 de 39** arquivos `.tsx` são Server Components;
os 10 restantes são folhas que precisam de interatividade real (formulário,
estado local, hook de dado no client).

`app/layout.tsx` é o exemplo mais importante: Server Component assíncrono,
busca a configuração institucional (tema, nome, ícone) direto no servidor
antes de montar o HTML — sem isso, o branding piscaria (config chegando
depois do primeiro paint). Trade-off já documentado em
[`CONFIGURACAO-INSTITUCIONAL.md`](CONFIGURACAO-INSTITUCIONAL.md): esse
fetch sem cache a cada request tira o app inteiro de prerender estático —
aceito de propósito, porque o app é 100% autenticado (nunca serviria uma
página cacheada/pública de qualquer jeito).

## 8. Atomic Design

**Status: avaliado, não adotado — decisão documentada.**

Ver a seção nova em
[`UI-COMPARTILHADA.md`](UI-COMPARTILHADA.md#atomic-design--avaliado-não-adotado).
Resumo: `shared/ui/` já tem uma taxonomia deliberada, só que organizada por
**papel** (`filtros`/`tabelas`/`relatorios`/`graficos`/`sistema`) em vez de
por camada estrutural (átomo/molécula/organismo). Reclassificar o que
funciona pela pergunta errada não é ganho — mesmo raciocínio que já decidiu
não trazer [shadcn/ui](tecnologias/shadcn-ui.md) nem
[MUI X Charts](tecnologias/mui-x-charts.md) pro projeto.

## 9. State Management

**Status: não precisa hoje — e o caso que normalmente pediria uma lib já está coberto.**

Zero libs de estado global instaladas (`zustand`/`redux`/`jotai`/`recoil`/
`mobx`), zero `createContext`/`useContext` próprio em todo o projeto (o
único "provider" é o `QueryClientProvider` do próprio TanStack Query).

O cenário que normalmente justifica um Zustand — dado compartilhado entre
telas/componentes sem parentesco direto, sem prop drilling — **já tem
solução funcionando**: o cache do TanStack Query. Exemplo real,
`shared/hooks/use-configuracao-institucional.ts`:

```ts
export const configInstitucionalKeys = { atual: ["config-institucional", "atual"] as const };

export function useConfiguracaoInstitucional() {
  return useQuery({ queryKey: configInstitucionalKeys.atual, queryFn: fetchConfiguracaoInstitucional });
}
```

Esse hook é chamado em **8 arquivos** sem parentesco na árvore de
componentes — `shared/layout/app-sidebar.tsx`, `shared/layout/app-header.tsx`,
`shared/ui/tabelas/table.tsx`, os dois formulários de
`features/admin/config-institucional/`, e os dois hooks de preview de
relatório de usuários. Todos leem a **mesma** config, do **mesmo** cache,
sem um `Context` ou `store` amarrando eles — a chave da query (`["config-
institucional", "atual"]`) é o único acoplamento entre eles. Quando o
admin salva uma mudança de aparência, `invalidateQueries` nessa chave já
propaga pra sidebar/header na hora, exatamente o comportamento que um
`store` global entregaria — só que sem dependência nova.

Filtro de relatório compartilhado entre a listagem e a página de preview de
export segue o mesmo espírito, mas por URL: os hooks de preview
(`use-relatorio-usuarios-{pdf,excel}-preview.ts`) leem `useSearchParams()`
em vez de um estado em memória — o filtro sobrevive a um reload/link
direto, o que um `store` client-side não daria de graça.

**Conclusão:** nenhuma lib de estado global entra agora. Se aparecer um
caso real que os dois padrões acima (cache do React Query + URL) não
cobrem — por exemplo, um wizard multi-etapa com estado complexo que
precisa sobreviver a navegação entre passos sem ir pro servidor a cada
etapa — Zustand é a escolha já pré-aprovada (API pequena, sem boilerplate
de Provider/reducer como Redux, encaixa em componente isolado sem exigir
reestruturar a árvore) — mas só quando esse caso existir de verdade.

## 10. Web Accessibility (a11y)

**Status: parcialmente coberto por biblioteca (verificado no código-fonte,
não assumido); um gap real encontrado e fechado nesta fase.**

Feedback de sucesso/erro (`shared/ui/sistema/toast.tsx`) e confirmação
(`shared/ui/sistema/confirm-dialog.ts`) usam SweetAlert2, que já cuida de
`role`/`aria-live`/foco sozinho — confirmado lendo a lib instalada, não só
supondo:

```js
// node_modules/sweetalert2/dist/sweetalert2.js
popup.setAttribute('role', params.toast ? 'alert' : 'dialog');
popup.setAttribute('aria-live', params.toast ? 'polite' : 'assertive');
```

`FormField` (`shared/forms/form-field.tsx`) já associa `label`/`htmlFor`
corretamente em todo campo de texto do projeto (ver
[`FORMULARIOS.md`](FORMULARIOS.md)).

**Achado real (27/08/2026), corrigido:** o único `<dialog>` HTML nativo do
projeto (`shared/ui/sistema/image-cropper-modal.tsx` — grep confirma que é
o único; todo o resto passa por SweetAlert2) usava só o atributo `open`,
nunca `.showModal()`. Isso é uma pegadinha real do elemento `<dialog>`: sem
`showModal()`, ele nunca entra no *top layer* do navegador — não ganha
foco preso (`focus trap`), não fecha no Esc, não tem `role="dialog"`
implícito. O estilo visual (backdrop, centralização) continuava certo
porque o DaisyUI estiliza via `.modal[open]` em CSS puro (confirmado no CSS
compilado, `.modal[open] { ... }`) — o bug era só de comportamento/
semântica, invisível a olho nu, real pra quem navega por teclado ou leitor
de tela.

Corrigido com `ref` + `useLayoutEffect` (não `useEffect`, pra abrir antes
do primeiro paint) chamando `showModal()` de verdade, mais `aria-labelledby`
apontando pro título, mais um listener de `close` (cobre o Esc, que fecha o
`<dialog>` sozinho sem passar pelos botões React) sincronizando de volta
pro estado do formulário:

```tsx
const dialogRef = useRef<HTMLDialogElement>(null);

useLayoutEffect(() => {
  const dialog = dialogRef.current;
  if (!dialog || !imageSrc) return;
  if (!dialog.open) dialog.showModal();
  dialog.addEventListener("close", onCancelar);
  return () => dialog.removeEventListener("close", onCancelar);
}, [imageSrc]);

// ...
<dialog ref={dialogRef} className="modal" aria-labelledby="image-cropper-titulo">
  <div className="modal-box max-w-lg">
    <h3 id="image-cropper-titulo" ...>Posicionar imagem</h3>
```

**Não auditado ainda (fora de escopo desta fase, registrado pra próxima
auditoria de a11y dedicada):** contraste de cor sob tema customizado (cores
de borda/texto que o admin escolhe em
[`APARENCIA-AVANCADA.md`](APARENCIA-AVANCADA.md) não têm checagem de
contraste mínimo), navegação por teclado ponta a ponta nas tabelas com
ordenação por coluna, `aria-sort` no cabeçalho de tabela ordenável.

## 11. Critical CSS

**Status: não se aplica ao perfil deste projeto — decisão de não implementar, não descuido.**

Critical CSS existe pra acelerar o primeiro paint de página **pública**,
onde métrica de SEO/Core Web Vitals de visitante anônimo importa (extrair
CSS above-the-fold, injetar inline, adiar o resto). Este projeto não tem
nenhuma página pública — ver item 14 (Progressive Enhancement) — então
essa métrica não tem quem meça. Tailwind v4 (Lightning CSS) e Next.js já
fazem code splitting de CSS por rota por padrão, o que já é a otimização
de CSS que faz sentido pro perfil de app interno autenticado. Extração
manual de critical CSS entraria como complexidade nova sem consumidor real
— contraria a mesma regra de "sem lib/config por precaução" já seguida no
resto do projeto.

## 12. Lazy Loading

**Status: já avaliado; um gap fechado (junto do item 5); dois casos
verificados e conscientemente deixados como estão.**

`next/dynamic` na Fase 5 acima *é* lazy loading de componente — mesma
técnica, mesmo commit.

`next/image` é deliberadamente não usado em lugar nenhum do projeto (grep
confirma) — motivo já documentado duas vezes no código
(`identidade-form.tsx`, `app-sidebar.tsx`): as imagens institucionais vêm
de um host configurável em runtime (`NEXT_PUBLIC_API_URL`), e `next/image`
exige domínio fixo em `next.config.ts` — incompatível com um host que só se
sabe no deploy, não no build.

Os únicos dois `<img>` nativos do projeto (grep confirma, são só esses
dois) foram avaliados pra `loading="lazy"` e **conscientemente não
receberam o atributo**: `app-sidebar.tsx` (ícone do sistema, sempre visível
no topo da sidebar) e `identidade-form.tsx` (preview de imagem, sempre
visível assim que a tela de Identidade carrega). `loading="lazy"` só ajuda
imagem abaixo da dobra — aplicado aqui não economizaria nada e, em alguns
navegadores, pode até atrasar levemente uma imagem que já devia carregar
imediato. Não existe hoje nenhuma imagem realmente fora da tela inicial no
projeto pra esse atributo valer a pena.

## 13. BFF (Backend For Frontend)

**Status: decisão explícita contra, já documentada — reforçada aqui.**

[`ROADMAP.md`](ROADMAP.md#decisão-revista-sem-route-handler--proxy-nextjs)
já registra a decisão: o browser chama o Rails **direto**, sem proxy
Next.js no meio, token em `localStorage`. Um BFF criaria uma segunda camada
de contrato (o Next reformatando/agregando dado do Rails só pra UI) que
esse projeto decidiu não ter — mais uma camada pra manter sincronizada com
a API real, sem ganho comprovado pro tamanho deste projeto.

`app/api/relatorios/{pdf,excel}/route.ts` (Fases 17/18) são a única
exceção, e são estreitas de propósito: existem só porque Puppeteer e
ExcelJS exigem runtime Node (não rodam no browser) — nunca reformatam ou
agregam dado do Rails, só recebem o dado que o client **já buscou e já
tem** e renderizam num formato de arquivo. Não é um BFF (não vira ponto
único de acesso a dado, não esconde contrato da API real) — é
infraestrutura de geração de arquivo, pelo motivo técnico específico de
precisar de Node. Guarda de sessão e validação Zod nessas duas rotas em
[`SEGURANCA-EXPORTACAO.md`](SEGURANCA-EXPORTACAO.md).

## 14. Progressive Enhancement

**Status: não se aplica — decisão consciente de não implementar.**

Progressive Enhancement parte de "conteúdo e funcionalidade básica
funcionam sem JS, pra qualquer visitante público, com interação avançada
por cima se o navegador suportar". Esse pressuposto não existe aqui: **toda**
rota do `base-front`, sem exceção, fica atrás de `AuthGuard`
(`features/autenticacao/login/components/auth-guard.tsx`, montado uma vez
em `AppShell`, envolvendo `(admin)/*` e `(dashboard)/*`) — a raiz (`/`)
redireciona direto pra dentro da área autenticada, sem nenhuma página de
conteúdo público em nenhum lugar. Não existe "visitante anônimo" pra
progressivamente aprimorar a experiência — é um app interno, o usuário já
chega autenticado ou é mandado pro login.

## 15. Lost Update

**Status: não tratado — nem no front, nem na API. Achado real, não
corrigido nesta fase (exige mudança nos dois lados, fora de escopo de um
ajuste só de front).**

Verificado na fonte: `ApplicationRecord` não tem `lock_version`
(optimistic locking do ActiveRecord), nenhum controller usa
`fresh_when`/`stale?` (ETag/`If-Match`), e nenhum formulário de edição do
front guarda `updated_at` pra comparar no save. Dois admins editando o
mesmo `a_papel` ao mesmo tempo: o segundo save sobrescreve o primeiro sem
aviso nenhum, sem erro, sem detecção. Documentado (não corrigido) porque a
correção exige mudança na API (coluna `lock_version` ou comparação de
`updated_at` no controller) **antes** de qualquer mudança no front fazer
sentido — front sozinho não detecta conflito que a API não sinaliza.
Detalhe completo, incluindo o que cada lado precisaria fazer, em
[`CONCEITOS-FRONTEND.md`
(How to Dev)](../../How to Dev/docs-frontend/conceitos-tecnicos/lost-update.md).

## 16. Web Concurrency

**Status: já coberto, duas estratégias diferentes, cada uma no lugar
certo.**

TanStack Query (a maioria das telas) descarta resultado de query
desatualizada sozinho, por `queryKey` — nenhum código do projeto precisa
de guarda manual. Os dois hooks de preview de relatório
(`use-relatorio-usuarios-{pdf,excel}-preview.ts`), que ficam fora do
TanStack Query de propósito (efeito colateral, não query cacheável), usam
um flag `cancelado` fechado sobre o efeito — mesmo problema, resolvido à
mão porque estão fora do alcance da lib. Nuance registrada: React Query
evita a UI mostrar resultado velho, mas não cancela a requisição HTTP em
si (não tem `signal` plugado do `queryFn` até o `fetch`) — não é bug,
custo desprezível pra chamada GET rápida contra a API interna.

## 17. Reverse Proxy

**Status: não configurado hoje; front já é "proxy-safe" por ausência,
verificado.**

Nenhum reverse proxy no deploy documentado. Grep confirma: zero leitura
de `X-Forwarded-*`, e — mais importante — zero construção de URL absoluta
própria (`window.location.origin`, `request.headers.get("host")`) em
qualquer lugar do front. Isso significa que colocar um proxy na frente
não quebraria nada por conta própria hoje. Registrado o que passaria a
importar se um proxy entrar no deploy (headers `X-Forwarded-Proto`/
`-Host` configurados nele, e cuidado se algum código futuro vier a montar
URL absoluta a partir da requisição).

## 18. Idempotência

**Status: parcial — proteção de clique duplo na UI, sem garantia de
rede.**

11 arquivos usam `disabled={isPending}`/`disabled={isSubmitting}` no
botão de submit — cobre o caso comum (clique duplo). Não cobre: retry de
rede (a API não faz retry automático em `POST` hoje, então o cenário não
acontece, mas também não tem proteção estrutural se um retry for
adicionado) e chave de idempotência real (verificado: nenhum endpoint da
API aceita `Idempotency-Key`). Documentado o que seria necessário nos
dois lados se um fluxo realmente sensível a duplicata aparecer — hoje
nenhum recurso do projeto tem essa criticidade.

## 19. WebSocket

**Status: não usado — sem cenário real no produto hoje.**

Grep confirma zero `WebSocket`/`socket.io` em todo o projeto. Nenhuma
tela precisa de push do servidor — toda busca é sob demanda (montagem,
filtro, invalidação pós-mutation). Candidato mais concreto se precisar um
dia: notificação de conflito em tempo real, ligado direto ao item 15
(Lost Update) — mas isso pressupõe a API expor o canal primeiro, o que
não existe.

## 20. WebRTC

**Status: não se aplica — produto sem áudio/vídeo/P2P.**

Zero uso, e diferente de WebSocket nem há cenário plausível: painel
administrativo não tem tela de chamada de vídeo, compartilhamento de
tela ou canal ponto a ponto entre usuários.

## 21. XHR / fetch

**Status: só `fetch()`, XHR nunca usado.**

Zero `XMLHttpRequest` em todo o projeto — toda chamada passa por um
único `request<T>()` (`services/api-admin.ts`, replicado nos outros
arquivos de `services/`) que já resolve a pegadinha de `fetch()` não
rejeitar em `404`/`500` (checagem manual de `response.ok`). O caso
clássico que ainda justificaria XHR — progresso de upload byte a byte —
não existe no projeto: o único upload (`identidade-form.tsx`, ícone/fundo
institucional) não tem barra de progresso, confirmado por grep
(`onProgress`, zero ocorrência).

## 22. Fetch x TanStack Query

**Status: já correto, divisão rígida por pasta, sem exceção encontrada.**

`services/*.ts`: só `fetch()`, zero `useQuery`/`useMutation`, zero import
de React — regra já documentada em
[`DADOS-E-API.md`](DADOS-E-API.md#services--só-fetch-zero-react).
`shared/hooks/`+`features/*/hooks/`: só TanStack Query — 11 arquivos
usam `useQuery`/`useMutation`, **nenhum** chama `fetch()` direto
(verificado, grep vazio). Cadeia real, `use-admin-resource.ts` →
`api-admin.ts`: `useAdminList` chama `adminList()` como `queryFn`;
`adminList()` chama `request()`, que é o único lugar que toca `fetch`.
Cada camada só conhece a de baixo — nunca um hook chamando `fetch` direto,
nunca um `services/*.ts` importando `useQuery`. As duas exceções
conhecidas (hooks de preview de relatório, fora do TanStack Query de
propósito) já estão documentadas no item 16 (Web Concurrency).

## Leitura recomendada

Nesta fase também entrou uma seção nova na wiki, fora do escopo de
"conceito técnico" mas citada a partir de vários deles: 5 livros de base
(Kleppmann, Winters/Manshreck/Wright, Tanenbaum/Van Steen, Grigorik,
Fowler), cada um com página própria (`assuntos principais` +
`onde aparece no padrão frontend`, linkando de volta pras páginas de
conceito relevantes) e uma vitrine com capa na home da wiki. Vive só em
How to Dev (`docs-frontend/leitura-recomendada/`) — não duplicado aqui,
por não ser histórico de implementação deste projeto.

## Resumo

| # | Conceito | Status |
|---|---|---|
| 1 | CORS | Já existe (dev); gap de produção já documentado |
| 2 | Debounce & Throttle | Debounce já implementado; throttle sem caso de uso |
| 3 | Virtual Scrolling | Resolvido por paginação no servidor |
| 4 | Hydration | Já tratado, 1 ponto justificado |
| 5 | Code Splitting | **Gap fechado nesta fase** (`next/dynamic`) |
| 6 | Tree Shaking | Já correto (exports nomeados) |
| 7 | SSR | Já é o padrão do projeto |
| 8 | Atomic Design | Avaliado, não adotado (decisão documentada) |
| 9 | State Management | Não precisa hoje (React Query cobre o caso real) |
| 10 | Web Accessibility | Parcial (lib); **gap fechado nesta fase** (dialog) |
| 11 | Critical CSS | Não se aplica a app interno autenticado |
| 12 | Lazy Loading | Coberto pelo item 5; 2 casos avaliados e descartados |
| 13 | BFF | Decisão explícita contra, já documentada |
| 14 | Progressive Enhancement | Não se aplica (zero página pública) |
| 15 | Lost Update | **Não tratado** — achado real, exige mudança na API primeiro |
| 16 | Web Concurrency | Já coberto (React Query + guarda manual nos 2 hooks fora dele) |
| 17 | Reverse Proxy | Não configurado; front já é proxy-safe por ausência de URL absoluta própria |
| 18 | Idempotência | Parcial — UI protegida, sem chave de idempotência de rede |
| 19 | WebSocket | Não usado — sem cenário real; candidato: aviso de conflito (Lost Update) |
| 20 | WebRTC | Não se aplica — produto sem áudio/vídeo/P2P |
| 21 | XHR / fetch | Só `fetch()`; XHR não necessário (sem upload com progresso) |
| 22 | Fetch x TanStack Query | Já correto — `fetch()` só em `services/`, Query só em `hooks/` |
