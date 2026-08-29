# Roadmap de implementação — base-front

Cada fase vira código aqui **e** documentação real na wiki (How to Dev, seção
"Padrão Frontend").

Duas referências de estrutura, cada uma com um papel diferente:

- `~/Documents/projetos/next-locacao/front` — inspirou a primeira versão
  (cookie httpOnly + proxy Next.js). Abandonada depois: ver "Decisão revista"
  abaixo.
- `~/Documents/projetos/otica/front` — referência atual de organização de
  pastas, nomenclatura (kebab-case, `password` em inglês) e padrão de UI
  (React Hook Form + Zod, sweetalert2 pra feedback). O front chama o backend
  **direto do browser** (sem Route Handler do Next.js no meio), com token em
  `localStorage`.

Backend de referência: `~/Documents/projetos/Padronizacao/api` (Rails,
Devise + devise-jwt) — é o padrão de API consolidado deste monorepo. Sempre
que uma fase mexer com autenticação/dados, o contrato real vem de lá, lido
direto do código (controllers/routes.rb), não inventado.

## Decisão revista: sem Route Handler / proxy Next.js

A primeira versão desta Fase 2 usava cookie httpOnly setado por
`app/api/auth/*` (Route Handlers do Next.js), proxying pro backend — padrão
do next-locacao. Foi trocado pelo padrão da otica: o browser chama o Rails
**direto** (`services/api-identity.ts`), token em `localStorage`
(`lib/auth.ts`).

**Atualização (Fase 17/18):** a frase "não existe mais nada em `app/api/*`"
deixou de ser verdade — `app/api/relatorios/{pdf,excel}/route.ts` existem,
por um motivo técnico específico (Puppeteer/ExcelJS exigem runtime Node, que
só roda em servidor), não porque a decisão acima foi revertida. As duas
rotas nunca fazem proxy/reshape de dado do Rails — só renderizam, num
formato de arquivo, dado que o client já buscou e já tem em mãos. Ver
[`CONCEITOS-FRONTEND.md`](CONCEITOS-FRONTEND.md#13-bff-backend-for-frontend)
pro porquê disso não ser um BFF.

Implicação real: o backend `api/` tem CORS **desativado** por padrão
(`config/initializers/cors.rb` comentado). Chamada direta do browser só
funciona depois de habilitar CORS lá, com `expose_headers: ["Authorization"]`
(o token vem no header da resposta do `sign_in`, não no body — sem isso o
`fetch` não consegue ler o header numa resposta cross-origin). Em modo fake
(sem `NEXT_PUBLIC_API_URL`) isso não importa, nada sai da máquina.

## Fases

### 1. Fundação — `concluído`
Pastas (`app/features/shared/lib/services`), layout raiz, Provider do React
Query, Tailwind (sem MUI/shadcn).

### 2. Autenticação — `concluído`
Estrutura em `features/autenticacao/`, um sub-diretório por fluxo (nada solto
direto em `features/autenticacao/`, tudo dentro do fluxo dono):

- `login/` — form, hook, schema, `types/`, `constants/` (credencial demo,
  rota pós-login), `AuthGuard` e `useSession` (ficam aqui por serem
  resultado direto do login, não um fluxo à parte).
- `logout/` — hook.
- `esqueci-senha/`, `alterar-senha/` (= redefinir senha via token),
  `primeiro-acesso/` — UI e validação completas, **mas sem chamada real**:
  o backend `api/` desliga o módulo `:passwords` do Devise
  (`skip: [..., :passwords, ...]` em `config/routes.rb`) e o `User` não tem
  flag de primeiro acesso. `services/api-identity.ts` documenta, em
  comentário, o endpoint esperado quando esses três ganharem backend.

`services/api-identity.ts` fala com `/api/v1/auth/{sign_in,sign_out,me}`
(contrato real: token no header `Authorization` da resposta do `sign_in`,
tudo envelopado em `{status, message, data}`). Sem `NEXT_PUBLIC_API_URL`
configurada, roda em **modo fake** (credencial demo
`demo@empresa.com.br` / `demo123`) — nunca em produção
(`NODE_ENV === "production"` desliga o fallback fake, erro alto e explícito
se `NEXT_PUBLIC_API_URL` for esquecida no deploy).

Sem papéis/permissões por área ainda — isso é a Fase 5.

**Dois gaps que dependem de mudança no backend `api/` (não implementados,
avisados aqui em vez de simulados):**

- **Refresh token**: devise-jwt aqui só tem revogação (`JTIMatcher`), sem
  endpoint de refresh. A otica tem rotação completa de refresh token no
  client — pra replicar, o backend precisa expor esse endpoint primeiro.
- **Detecção de "primeiro acesso" no login**: na otica, o login devolve
  `{primeiro_acesso: true, reset_token}` em vez de sessão quando a senha
  ainda é a padrão, e o front redireciona sozinho pra `/primeiro-acesso`. O
  `sign_in` deste backend nunca devolve esse formato — precisaria de uma
  flag no `User` + branch no `SessionsController` antes de fazer sentido
  aqui.

### 3. Formulários — `concluído`
`shared/forms/form-field.tsx` (label + input + erro) + convenção: schema Zod
em `schemas/*.schema.ts` → `zodResolver` no `useForm` → `useMutation` do
React Query pra submissão → feedback via `shared/ui/sistema/toast.tsx`
(sweetalert2, mesmo padrão da otica) + `form.setError` no campo relevante
quando faz sentido (ex.: login marca "senha" sem repetir a mensagem, que já
foi pro toast). `login/components/login-form.tsx` é o primeiro exemplo real;
`esqueci-senha`, `alterar-senha` e `primeiro-acesso` seguem o mesmo padrão.

### 4. Camada de dados / API — `concluído`
`services/api-admin.ts` genérico (`adminList/Get/Create/Update/Delete`, pra
qualquer `/api/v1/admin/<recurso>`) + `shared/hooks/use-admin-resource.ts`
(os mesmos 5, envolvidos em `useQuery`/`useMutation`, já com toast e
invalidação de cache). Toda feature de admin monta hook de domínio em cima
disso, nunca repete a lógica de fetch. Detalhe completo, incluindo `lib/` e
convenção de `types/schemas/hooks/constants` por feature, em
[`DADOS-E-API.md`](DADOS-E-API.md).

### 5. Autorização e Papéis — `concluído`
`features/admin/{usuarios,tipos-usuario,papeis,permissoes}/` — CRUD real
contra o RBAC granular do backend (`a_papeis`/`a_permissoes`/
`a_papeis_permissoes`/`a_usuarios_papeis`), incluindo a matriz recurso×ação
que cria permissão nova on-the-fly ao marcar uma combinação inédita.
`a_recursos` é read-only no front de propósito (cadastro é tarefa do
programador, não do admin — errar o nome exato da classe Ruby cria
permissão morta sem erro visível). Detalhe completo em
[`ADMINISTRACAO-RBAC.md`](ADMINISTRACAO-RBAC.md).

Autorização por papel **na UI** (esconder rota/menu sem permissão) ainda
não existe — hoje o RBAC é só sobre o que a API aceita, não sobre o que o
front mostra. Gap conhecido, não bloqueante pra fundação.

### 6. Design system — `parcial`
`theme/` (cores, fontes, ícones — barrel curado de `lucide-react`) +
`shared/ui/` organizado por categoria (`filtros`, `graficos`, `relatorios`,
`sistema`, `tabelas`) + `shared/forms/form-field.tsx`. Cresce sob demanda,
sem componente especulativo. Padrão de UI compartilhada em
[`UI-COMPARTILHADA.md`](UI-COMPARTILHADA.md), tabela em
[`TABELAS.md`](TABELAS.md) e formulário em [`FORMULARIOS.md`](FORMULARIOS.md).

### 7. Layout de aplicação — `concluído`
`shared/layout/{app-shell,app-sidebar,app-header}.tsx` — sidebar + topbar +
`AuthGuard`, drawer mobile via CSS puro do DaisyUI (checkbox, sem
`useState`). Tamanho de sidebar/topbar não é mais fixo no Tailwind: vem da
Configuração Institucional (Fase 11), arrastável pelo admin. Detalhe
completo em [`LAYOUT-DA-APLICACAO.md`](LAYOUT-DA-APLICACAO.md).

### 8. Erros e estados — `parcial`
Toast (sweetalert2) desde a Fase 3. `error.tsx`/`global-error.tsx`/
`loading.tsx`/`not-found.tsx` do Next.js já existem
(`features/sistema/erros/`). Falta: empty state padronizado (hoje cada
lista escreve a própria mensagem "Nenhum X encontrado").

### 9. Testes — `planejado`
Convenção de testes unitários/integração/e2e.

### 10. Qualidade e ferramentas — `planejado`
Lint/format/CI, convenção de commits.

### 11. Configuração institucional — `concluído`
Fase que não estava prevista originalmente — admin configura tema, fonte,
escala, tamanho de sidebar/topbar (arrastável), nome do sistema, ícone e
imagem de fundo do login, valendo por padrão pra todo mundo do tenant
(usuário ainda pode trocar o próprio tema). Exigiu tabela nova na API
(`c_configuracoes`, um por tenant) e um endpoint público
(`GET /c_configuracoes/atual`, sem sessão — a tela de login também precisa
de branding). Aplicado no `app/layout.tsx` via Server Component assíncrono,
sem flash — trade-off aceito: o app inteiro virou dynamic rendering (sem
prerender estático), porque o layout raiz faz fetch sem cache a cada
request. Detalhe completo em
[`CONFIGURACAO-INSTITUCIONAL.md`](CONFIGURACAO-INSTITUCIONAL.md).

### 12. Referenciais — `concluído`
`features/admin/referenciais/` traz os CRUDs admin já expostos pela API:
Países (`g_pais`), Estados (`g_estados`), Municípios (`g_municipios`),
Tenants (`a_tenants`), Órgãos (`a_orgaos`), Tipos de unidade
(`a_tipos_unidade`) e Unidades (`a_unidades`). O front usa rotas dinâmicas
`/referenciais/[recurso]`, uma config por cadastro e o `DataTable` padrão.
Detalhe completo em [`REFERENCIAIS.md`](REFERENCIAIS.md).

### 13. Relatórios e gráficos — `concluído`
`features/relatorios/usuarios/` é o primeiro relatório real: filtros e tabela
compartilham o padrão de listas admin, KPIs usam `shared/ui/relatorios` e os
gráficos usam wrappers EvilCharts sobre `echarts` em `shared/ui/graficos`.
PDF continua com Puppeteer em rota local Node.js.

### 14. Upload de imagem com recorte — `concluído`
Campo de imagem (ícone do sistema, fundo do login — Fase 11) que já tem
proporção/tamanho máximo fixados em código exige que o admin **posicione**
a imagem antes de enviar, não só escolha um arquivo. `ImageCropperModal`
(`shared/ui/sistema/`) usa `react-easy-crop` pra interação (arrastar/zoom) e
`lib/image-crop.ts` pra desenhar a área recortada num canvas já
redimensionado pro máximo do campo. Padrão genérico — qualquer campo de
imagem novo só declara `aspect`/`dimensoesMaximas` num `constants/imagem.ts`
próprio. Detalhe completo, incluindo o porquê de renderizar o modal via
`createPortal` (evita `<form>` aninhado quando aberto de dentro de um
formulário), em [`UPLOAD-DE-IMAGEM.md`](UPLOAD-DE-IMAGEM.md).

### 15. Estilos de PDF organizados por template — `concluído`
A Fase 13 nasceu com uma rota de PDF por relatório e um único visual
embutido nela. Reorganizado em `lib/server/relatorio-pdf/`: `core.ts`
(motor Puppeteer, sem saber de HTML de relatório) + `templates/` (um
arquivo por **estilo visual** — `simples`, cartões de KPI + tabela;
`institucional`, cabeçalho com marca, resumo, tabela, rodapé com emissor,
inspirado no PDF do brasilconstroi) + `index.ts` (dispatcher: recebe nome
do template + `RelatorioPdfDados`, devolve o PDF). A rota
(`app/api/relatorios/pdf/route.ts`) virou única e genérica — não é mais
uma rota por relatório. Relatório de usuários migrou pro estilo
`institucional`. Detalhe completo em [`ESTILOS-DE-PDF.md`](ESTILOS-DE-PDF.md).

### 16. Aparência avançada — overrides por cima do tema — `concluído`
Além de tema/fonte/escala (que só afetam o conteúdo da página), o admin
agora controla, opcionalmente: fonte e cor de sidebar/topbar (separado em
sidebar geral, títulos de seção e topbar), tamanho do título de página
(`<h1>` unificado em `shared/ui/sistema/page-title.tsx`, antes repetido em
~28 arquivos), e cor de borda (sistema geral + tabela, independentes) e
cor de texto do sistema — os dois últimos sobrescrevendo direto o mesmo
token DaisyUI que `text-base-content`/`border-base-300` já usavam em
tudo, sem precisar tocar arquivo por arquivo. Todo campo novo é nullable
e auditável (herdado de `ApplicationRecord`, igual qualquer coluna do
projeto) — sem valor, o comportamento é idêntico a antes desses campos
existirem. Detalhe completo, incluindo onde cada override é aplicado no
código e o limite real encontrado (borda de `<input>`/`<select>` do
DaisyUI não segue `cor_borda_sistema`), em
[`APARENCIA-AVANCADA.md`](APARENCIA-AVANCADA.md).

### 17. Segurança do PDF + preview antes de baixar — `concluído`
Auditoria da rota de PDF (a única deste projeto que monta HTML a partir de
dado dinâmico pra um motor de renderização): achado real — a rota não
exigia sessão nenhuma, qualquer requisição gerava PDF via Puppeteer
(recurso caro, abuso óbvio). Corrigido com `lib/server/auth-guard.ts`
(exige token válido, confirmado contra `GET /auth/me` na api/ real) +
`lib/server/relatorio-pdf/request-schema.ts` (Zod valida o corpo inteiro
antes de qualquer template rodar — `filename` restrito a formato seguro
de propósito, defesa contra header injection no `Content-Disposition`).
Escape de HTML (`escapeHtml`/`valorHtml`, já existia desde a Fase 13)
testado ao vivo com payload de XSS real contra a rota — texto malicioso
aparece literal no PDF, nunca executa. Exportar PDF não baixa mais direto
no clique: navega pra uma página própria de pré-visualização
(`/relatorios/usuarios/pdf-preview`), download real só com confirmação
dentro dela. Detalhe completo, incluindo os testes reais feitos contra a
rota rodando, em [`SEGURANCA-EXPORTACAO.md`](SEGURANCA-EXPORTACAO.md).

### 18. Exportar Excel ao lado do PDF + preview em página própria — `concluído`
Segundo formato de export, ao lado do PDF em cada relatório. `lib/server/
relatorio-excel/` — mesma arquitetura dados×motor×estilo do PDF (ver
[`ESTILOS-DE-EXCEL.md`](ESTILOS-DE-EXCEL.md)), motor **ExcelJS** (não
`xlsx`/SheetJS — a versão livre no npm não escreve estilo de célula,
paywall na "Pro"). Mesma guarda de sessão e validação Zod do PDF (segunda
rota, `app/api/relatorios/excel/route.ts`) + uma ameaça própria de
planilha: injeção de fórmula (célula começando com `=`/`+`/`-`/`@` pode
virar fórmula executada ao abrir no Excel) — `valorCelulaSegura`
neutraliza prefixando `'`, testado no XML real do `.xlsx` gerado (não só
no código), confirmando ausência de `<f>` (fórmula) mesmo com payload de
ataque na célula.

**Preview corrigido pra página própria, não modal** (revisão de decisão:
a primeira versão desta fase e da Fase 17 usava `<dialog>` modal sobre a
listagem — trocado por pedido explícito, e porque uma rota isolada por
relatório/formato é mais fácil de auditar). Cada relatório ganha um par
hook + página de preview específico
(`features/relatorios/<relatorio>/hooks/use-relatorio-<relatorio>-{pdf,excel}-preview.ts`,
`.../components/relatorio-<relatorio>-{pdf,excel}-preview-page.tsx`) —
nunca um componente genérico escondendo como a rota protegida é chamada.
Preview de Excel é **data-first** (mostra a tabela de origem direto, sem
round-trip ao servidor — `.xlsx` não tem visualizador nativo no browser,
diferente do PDF que renderiza num `<iframe>` de verdade); só gera o
arquivo real no clique em "Baixar Excel". Detalhe completo em
[`SEGURANCA-EXPORTACAO.md`](SEGURANCA-EXPORTACAO.md).

Aproveitado pra fechar um gap de navegação encontrado junto: `/relatorios/
orgaos` e `/relatorios/unidades` já existiam como rota (`features/
relatorios/{orgaos,unidades}/`) mas não apareciam na sidebar — só
`/relatorios/usuarios` estava listado em `SIDEBAR_SECTIONS`
(`shared/layout/navigation.ts`). Os dois entraram na seção "Relatórios"
da sidebar.

### 19. Placeholder + limite de caracteres em todo campo de texto — `concluído`
Achado real: vários campos (`nome`/`email` de usuário, `descricao` de tipo
de usuário/papel, `nome_sistema`, perfil) não tinham `placeholder`, e
nenhum campo fora `referenciais/` tinha `maxLength` — nada impedia colar
um texto enorme em `nome`. `shared/forms/form-field.tsx` já aceitava os
dois via spread de `InputHTMLAttributes` (nenhuma mudança de componente
precisou); o gap era só cada call site não passar. Corrigido em todo
formulário de texto do admin + autenticação. `lib/form-limits.ts` centraliza
os números — `MAX_STRING_LENGTH = 255`/`MAX_TEXT_LENGTH = 10_000` espelham
`ApplicationRecord::MAX_STRING_LENGTH`/`MAX_TEXT_LENGTH`
(`api/app/models/application_record.rb`, validação real e sempre ativa em
toda coluna `:string`/`:text` de todo model) — nunca um número solto
reinventado por arquivo. `MAX_PASSWORD_LENGTH = 128` é caso à parte:
`password` é atributo virtual do Devise, não coluna real, então não passa
pelo teto genérico — o valor espelha `config.password_length = 6..128`
(hoje inerte, `User` não inclui `:validatable`), usado como convenção de
UX honesta. Verificado ao vivo: digitar 400 caracteres em `nome` resulta
em exatamente 255 no campo. Aproveitado pra corrigir também um `.min(2)`
inventado em `config.schema.ts` (mesma classe de bug já documentada em
[`FORMULARIOS.md`](FORMULARIOS.md) pra `usuarioFormSchema`, mas que
persistia nesse arquivo). Detalhe completo em
[`FORMULARIOS.md`](FORMULARIOS.md#todo-campo-de-texto-placeholder-real--maxlength).

### 20. Auditoria de 14 conceitos técnicos de frontend — `concluído`
Pedido direto: levantar 14 conceitos padrão de mercado (CORS, debounce/
throttle, virtual scrolling, hydration, code splitting, tree shaking, SSR,
Atomic Design, state management, a11y, critical CSS, lazy loading, BFF,
progressive enhancement) contra o estado real do projeto — não implementar
tudo às cegas, e sinalizar antes o que não se encaixasse na arquitetura já
decidida. Dois itens foram sinalizados e resolvidos com o usuário antes de
qualquer código: **Atomic Design** (a árvore de `shared/ui/` já é uma
taxonomia deliberada, por papel — decisão: manter e documentar por quê, sem
reorganizar) e **state management** (nenhuma lib global instalada, nenhum
caso real encontrado que o cache do TanStack Query + `useSearchParams()` já
não cubra — decisão: não instalar Zustand agora, documentar o caso real que
já cobre o cenário, registrar Zustand como escolha pré-aprovada pro dia que
surgir um caso de verdade). A maioria dos 12 itens restantes já estava
coberta (debounce, hydration, tree shaking, SSR, BFF) ou resolvida de outro
jeito (virtual scrolling por paginação no servidor; critical CSS e
progressive enhancement não se aplicam a um app 100% autenticado sem página
pública). Dois gaps reais, fechados nesta fase: **code splitting**
(`ImageCropperModal` — que empacota `react-easy-crop` — virou
`next/dynamic(..., { ssr: false })` em `identidade-form.tsx`, só carrega no
bundle quando alguém escolhe um arquivo) e **acessibilidade** (o único
`<dialog>` HTML nativo do projeto, o mesmo `ImageCropperModal`, usava só o
atributo `open`, nunca `showModal()` — sem foco preso, sem fechar no Esc,
sem `role="dialog"` implícito; corrigido com `ref` + `showModal()` real +
`aria-labelledby` + sincronização do Esc de volta pro estado React).
Detalhe completo, item a item, em
[`CONCEITOS-FRONTEND.md`](CONCEITOS-FRONTEND.md).

### 21. Auditoria de 10 conceitos de proteção/segurança — `concluído`
Mesmo formato da Fase 20, agora pro lado de segurança: XSS, CSP, CSRF,
cookies HttpOnly/Secure, SRI, clickjacking, cabeçalhos de segurança HTTP,
sanitização de inputs, poluição de protótipo, MitM. Quatro já estavam
cobertos por padrão já existente (XSS e sanitização de inputs pelo escape
automático do React + `escapeHtml`/`valorCelulaSegura` das Fases 17/18);
três não se aplicam à arquitetura deste projeto, verificado antes de
declarar isso (CSRF e cookies HttpOnly/Secure porque a auth usa token em
header, nunca cookie — grep confirma zero cookie em todo o projeto; SRI
porque não existe script/CDN externo). **Achado real, corrigido:**
`next.config.ts` estava vazio e não existia `middleware.ts` — zero CSP,
zero cabeçalho de segurança, gap já flagueado como limite conhecido em
`MEDIDAS-DE-SEGURANCA.md` (mirror How to Dev) antes desta fase. Fechado com
`middleware.ts` novo gerando nonce por requisição pro CSP (`script-src`
com `'strict-dynamic'`, cobrindo os chunks de `next/dynamic` da Fase 20;
`style-src 'unsafe-inline'` como exceção consciente, pela Aparência
avançada da Fase 16 depender de muito `style` inline; `img-src`/
`connect-src` liberando a origem real da API, derivada de
`NEXT_PUBLIC_API_URL` em runtime) + `X-Frame-Options`,
`X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`,
`Permissions-Policy` estáticos em `next.config.ts`. Verificado ao vivo
contra o dev server rodando — `curl -D -` confirmou todo cabeçalho
presente, nonce do CSP batendo com o nonce do `<script>` do tema, e
páginas carregando normalmente sem quebra de CSP. Detalhe completo, item a
item, em [`SEGURANCA-FRONTEND.md`](SEGURANCA-FRONTEND.md).

### 22. Auditoria de rotas contra projetos irmãos — `concluído`
Comparação real de `lib/routes.ts` (notação húngara/Rails-like já em uso
desde a Fase 2) contra três projetos irmãos que usam o mesmo template de
backend Rails: `frotas-mvc`, `nextfrotas-api` e `nextfrotas-combustivel`
(`~/Documents/projetos/frotas/frotas-mvc/`). Achado principal: nenhum gap
de implementação — agente de exploração confirmou, via grep completo,
zero rota em `app/` sem helper correspondente e zero string literal de
rota em qualquer outro arquivo do projeto, contra os dois extremos dos
irmãos (`nextfrotas-combustivel` não tem helper de rota nenhum, navegação
100% string literal; `frotas-mvc` tem ~90 rotas de relatório nomeadas na
mão, sem nesting, por não aplicar a mesma disciplina numa seção). O
prefixo `m_` (`m_usuarios_path`, sem equivalente na tabela `users` do
backend) quase foi renomeado por parecer inconsistente — achado real
evitou isso: `frotas-mvc/config/routes.rb` usa o mesmo `m_` pro mesmo
`User`/`users` sem prefixo, decidido de forma independente, validando a
escolha em vez de contradizê-la. Uma convenção nova foi documentada sem
gerar código (`<verbo>_<modulo>_<recurso>_path(id)`, pra ação tipo
aprovar/cancelar/validar, vista em `member`/`collection` do
`nextfrotas-api`/`frotas-mvc`) — sem uso real no projeto hoje, então sem
helper novo em `lib/routes.ts`, só o nome convencionado e a prova de que
`memberPath` (já existente) já monta isso sem função nova. Detalhe
completo em [`ROTEAMENTO.md`](ROTEAMENTO.md).

### 23. Quatro conceitos técnicos novos + seção de leitura recomendada — `concluído`
Extensão da Fase 20: mais 4 conceitos (lost update, web concurrency,
reverse proxy, idempotência), cada um investigado contra o código real
antes de escrever qualquer linha, seguindo a mesma régua — "se não é
feito, aponta pra onde deveria ser feito (API ou front) e o que faltaria,
nunca implementa às cegas". Único achado real sem correção nesta fase:
**lost update** não é tratado nem na API (sem `lock_version`, sem
`fresh_when`/`stale?`) nem no front (formulário de edição não guarda
`updated_at`) — documentado como pendência que exige mudança na API
primeiro, já que o front não tem como detectar conflito que a API não
sinaliza. Os outros três já estão cobertos (web concurrency, via
TanStack Query + o flag `cancelado` já existente nos 2 hooks de preview)
ou não se aplicam com justificativa concreta (reverse proxy: front já não
constrói URL absoluta própria, verificado por grep; idempotência: 11
formulários já desabilitam o botão durante o submit, só falta a garantia
de rede que exigiria mudança na API). Também nasceu, junto,
`docs-frontend/leitura-recomendada/` na wiki: 5 livros de base
(Kleppmann, Software Engineering at Google, Tanenbaum/Van Steen,
Grigorik, Fowler) com página própria (capa, assuntos
principais, "onde aparece no padrão frontend") e uma vitrine com capa na
home da wiki — capas reais via Open Library (ISBN verificado por busca
antes de usar, imagem baixada e conferida visualmente, não só assumida).
Achado técnico no processo: a primeira versão usava `<img>`/`<table>` em
HTML puro dentro do markdown, e o pipeline da wiki **escapa** HTML cru em
vez de renderizar — corrigido trocando por sintaxe markdown padrão
(`![alt](url)`, tabela GFM), confirmado depois com o HTML real devolvido
pelo servidor, não só assumido corrigido. Detalhe completo em
[`CONCEITOS-FRONTEND.md`](CONCEITOS-FRONTEND.md#15-lost-update).

### 24. WebSocket, WebRTC, XHR/fetch e Fetch x TanStack Query — `concluído`
Mais 4 conceitos técnicos, pedido explícito: as três tecnologias de
transporte do navegador (WebSocket, WebRTC, XHR vs `fetch`) e a divisão
de responsabilidade entre `fetch()` puro e TanStack Query — este último
pedido junto de "pensa com base em como organizo aqui", ou seja, não uma
definição genérica, e sim mapear exatamente onde cada um vive no projeto.
Achado confirmando disciplina já existente, sem gap: `fetch()` só existe
dentro de `services/*.ts` (mais `lib/server/auth-guard.ts`, a mesma
camada de fronteira); `useQuery`/`useMutation` só existem dentro de pasta
`hooks/` (`shared/hooks/` ou `features/*/hooks/`); zero hook chama
`fetch()` direto, zero `services/*.ts` importa React ou TanStack Query —
grep confirma as duas direções, sem exceção. WebSocket e WebRTC: zero uso
em todo o projeto — WebSocket ficou com um "quando usaríamos" concreto
(aviso de conflito em tempo real, amarrado ao achado de Lost Update da
Fase 23), WebRTC sem cenário plausível nenhum (produto não tem
áudio/vídeo/P2P). Detalhe completo em
[`CONCEITOS-FRONTEND.md`](CONCEITOS-FRONTEND.md#19-websocket).

### 25. Auditoria de vídeo/glossário na wiki — `concluído`
Pedido direto: verificar páginas sem vídeo explicativo e sem glossário em
toda a wiki (não só o que foi escrito nesta sessão). Achado real sobre
como o glossário funciona (lido no código do `How to Dev`, não assumido):
`src/components/toc.tsx`/`article-layout.tsx` renderizam um "Glossário"
que é o sumário (TOC) gerado automaticamente a partir dos headings `##`/
`###` de cada página (`getHeadings()` em `src/lib/docs.ts`) — não é
conteúdo manual, então "sem glossário" só é possível numa página sem
nenhum heading `##`/`###`. Encontrado: 17 arquivos em
`docs-frontend/tecnologias/` (`nextjs.md`, `tailwind.md`, `daisyui.md`,
`zod.md` e mais 13) usavam só texto em negrito (`**O que é:**` etc.) como
pseudo-heading, do molde documentado em `tecnologias/README.md` — zero
heading real, glossário nesses arquivos caía num link "Visão geral" que
não apontava pra nenhum `id` de verdade na página. Corrigido convertendo
cada label em negrito pra heading `##` real (mesmo texto, sem mudar
conteúdo), com capitalização ajustada e um caso de heading duplicado
(`sweetalert2.md`, dois "Exemplo real") desambiguado. Verificado ao vivo
contra o dev server — TOC de cada página confirmada com os itens certos,
não só assumida corrigida. Vídeo: 14 páginas do que foi escrito nesta
sessão ainda não têm `video:` no frontmatter (as 4 novas de conceitos
técnicos + 5 de leitura recomendada + `SANITIZACAO-DE-INPUTS.md`) — não
preenchido, porque vídeo é gravação real adicionada pela equipe depois
(confirmado ao longo da sessão: várias páginas ganharam `video:` real por
um processo externo depois de escritas), nunca um ID inventado.

### 26. Auditoria contra 5 cheat sheets do OWASP (Authentication, Authorization, JWT, Forgot Password) — `concluído`
Pedido de análise: comparar o padrão contra Authentication, Authorization,
Authorization Testing Automation, JSON Web Token e Forgot Password Cheat
Sheet — os 4 conteúdos reais buscados no site do OWASP antes de qualquer
achado, não citados de memória. Achado mais crítico, corrigido em `api/`
com aprovação explícita do usuário (único item dos vários achados com
risco de segurança real e imediato): `password_length = 6..128` estava
configurado em `devise.rb`, mas inerte — `User` não incluía
`:validatable`, então a API aceitava senha de 1 caractere, ou senha em
branco (deixando o usuário sem `encrypted_password` válido, conta
inutilizável) se chamada direto. Corrigido com `validates :password,
presence: true, on: :create` + `validates :password, length: { within:
Devise.password_length }, allow_blank: true` em `User` — sem trazer
`:validatable` inteiro (validaria e-mail junto, fora do pedido).
Verificado com `bin/rails runner` (4 cenários: branco no create rejeitado,
3 caracteres rejeitado, senha real aceita, branco no update preservado) e
os três gates de `api/CLAUDE.md` (`bin/rails test` 105/105, `bin/rubocop`,
`bin/brakeman --no-pager`) limpos. `lib/form-limits.ts` e
`docs/FORMULARIOS.md` atualizados pra não afirmar mais "inerte". Segundo
achado grande, não corrigido (fora do que foi aprovado): o módulo
`:passwords` do Devise está desativado de propósito
(`api/config/routes.rb`, `skip: [...]`) — não existe endpoint de
"esqueci minha senha" nem "trocar senha logado" na API; o front já tem
tela/schema prontos, documentando a ausência com um stub 501 explícito em
vez de fingir que funciona. Corrigido, só no front, sem esperar a API
existir: `alterar-senha` assumia auto-login pós-reset (contraria o OWASP
Forgot Password direto) — trocado pra redirecionar pra `/login`.
`primeiro-acesso` ficou como estava, de propósito (ativação de conta via
convite, não recuperação de conta comprometida — cenário diferente do que
o cheat sheet cobre). Confirmado correto sem mudança: mensagem de login
sem enumeração, rack-attack real de três camadas (IP/e-mail/burst),
padrão fetch-then-authorize do CanCanCan (cross-tenant vira 403 real, não
vazamento — achado menor: 403 em vez de 404, oráculo de existência de
baixa severidade), front nunca confia em checagem client-side pra
autorização, JWT com claims mínimas e revogação real via `jti` (não
`Null`). Achados menores, não corrigidos (fora do que foi aprovado): zero
log de evento de segurança (`Rails.logger` só cobre erro interno), zero
MFA, cobertura de teste de autorização só no admin wildcard (16 arquivos
de teste de controller, nenhum usa o fixture com escopo restrito) — todos
exigem mudança em `api/`, ficam documentados pra quando o time decidir
mexer nisso. Detalhe completo em [`OWASP-AUTH-AUTHZ.md`](OWASP-AUTH-AUTHZ.md).

### 27. Data hardcoded no How to Dev — `concluído`
Achado real, fora de `front/`: toda página do `How to Dev` mostrava a
mesma data fixa ("26 de agosto de 2026"), não importa quando o arquivo
foi escrito — `AreaDoc` nunca passava a prop `data` pro `ArticleLayout`,
que caía sempre no fallback hardcoded (`data ?? "26 de agosto de 2026"`).
Corrigido em `How to Dev/src/lib/docs.ts`: `readDoc` agora deriva a data
real (frontmatter `date`/`data` explícito, senão `fs.statSync(file).mtime`
formatado em pt-BR), `DocContent` ganhou o campo, `AreaDoc` passa
`data={doc.date}`, e `ArticleLayout` teve `data` promovido de opcional
pra obrigatório (único consumidor do componente é `AreaDoc`) — pra essa
classe de bug (esquecer de passar a prop, cair num fallback velho) não
poder voltar a acontecer. Verificado ao vivo: páginas escritas em dias
diferentes desta sessão (27, 28, 29 de agosto) mostrando datas diferentes
e corretas, não mais a mesma data fixa.

### 28. Logs de auditoria (PaperTrail) + proteção da própria wiki — `concluído`
Usuário perguntou se um hacker com acesso à wiki de segurança
encontraria vulnerabilidade com esse conhecimento — resposta: sim, se a
wiki estiver acessível sem controle (thresholds exatos do rack-attack,
confirmação de ausência de log, comportamento IDOR 403-vs-404 = achados
que economizam reconhecimento de verdade pro atacante). Ao verificar,
achado real: `How to Dev` não tem autenticação nenhuma no próprio
código-fonte (zero `middleware.ts`, zero `AuthGuard`, zero checagem de
senha) — usuário pediu pra documentar e conferir se `base-front` tem
padrão pra servir de referência. Verificado e documentado: `AuthGuard`
do `base-front` é client-side, não se aplica ao `How to Dev` (conteúdo já
vem completo no HTML da primeira resposta, não atrás de `fetch`
condicional) — a referência certa é o mecanismo do `middleware.ts`
(server-side, intercepta antes da rota), adaptado com Basic Auth em vez
de CSP, já que a wiki não tem base de usuário própria. Segundo achado, a
partir de uma observação do usuário sobre uma rota de logs que "deveria"
existir: `ApplicationRecord` já tem `has_paper_trail` gravando toda
mudança de model desde a primeira migration (tabela `versions` real,
populada) — mas nenhum controller da API expõe isso, e o front não tem
nenhuma tela de logs/auditoria. Precisão registrada pra não confundir:
isso é diferente do gap de log de evento de segurança da Fase 26 —
PaperTrail só grava mudança de model, login falho e autorização negada
nunca tocam um model, então nunca apareceriam ali mesmo com uma tela
construída. Os dois achados foram implementados no fim desta mesma fase,
com aprovação explícita do usuário pra cada um — ver Fase 29.
Detalhe completo em
[`LOGS-E-PROTECAO-DA-WIKI.md`](LOGS-E-PROTECAO-DA-WIKI.md).

### 29. Implementação: proteção do How to Dev + tela de logs de auditoria — `concluído`
Os dois achados da Fase 28, implementados depois de aprovação explícita
do usuário pra cada um. **Proteção da wiki**: `How to Dev/middleware.ts`
novo, HTTP Basic Auth (`WIKI_BASIC_AUTH_USER`/`PASS`), falha fechada em
produção sem credencial, comparação resistente a timing attack —
verificado ao vivo contra build de produção real (porta isolada, não a
compartilhada): sem credencial 401, credencial errada 401, credencial
certa 200. **Logs de auditoria**: `GET/show /api/v1/admin/versions` +
`/logs`/`/logs/[id]` no front. Três bugs reais encontrados e corrigidos
no processo — nenhum óbvio de antemão: (1) nomear arquivo/classe próprio
`PaperTrail::Version::List` derruba o boot da aplicação inteira (Zeitwerk
auto-vivifica `PaperTrail::Version` como módulo vazio a partir do caminho
da pasta, antes da gem `paper_trail` carregar a classe real —
`TypeError: Version is not a class`; corrigido com namespace próprio,
`VersionLog::List`/`VersionLogSerializer`, sem tocar `PaperTrail::`); (2)
`render_success(data: @registro)` no `show` não usa serializer
customizado quando o nome não bate a convenção do ActiveModelSerializer
(`PaperTrail::VersionSerializer`, que não existe de propósito) — saía
`as_json` cru sem filtro de coluna; corrigido serializando explícito no
controller; (3) teste de controller usando `as: :json` num GET com
filtro manda os params como corpo, não querystring, nunca casava a rota
(404) — bug de teste, não de código. Os três gates de `api/CLAUDE.md`
(test/rubocop/brakeman) limpos depois. `swagger.yaml`/`gerar_postman.rb`
não resolvem recurso namespaced/só-leitura automaticamente — as duas
entradas foram adicionadas à mão. Verificado ao vivo contra o dev server
real da API (JWT mintado via Rails console, nunca senha resetada) com
dado real (201 versões reais acumuladas nesta sessão). Efeito colateral
corrigido junto, sem relação com `versions`: aviso de depreciação do
Next.js 16 no build (`middleware.ts` → `proxy.ts`, `AGENTS.md` deste
projeto pede pra nunca ignorar aviso de depreciação) —
`front/middleware.ts` renomeado pra `front/proxy.ts`. `How to Dev/
middleware.ts` não precisou do mesmo tratamento (build real verificado,
sem aviso). Detalhe completo em
[`LOGS-E-PROTECAO-DA-WIKI.md`](LOGS-E-PROTECAO-DA-WIKI.md).
