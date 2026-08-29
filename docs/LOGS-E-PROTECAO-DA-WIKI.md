# Logs de auditoria + proteção da própria wiki

> Dois achados a partir de uma pergunta direta do usuário sobre se a
> própria documentação (How to Dev), tendo detalhe real de segurança
> (thresholds do rack-attack, ausência de log, comportamento IDOR),
> ajudaria um atacante que tivesse acesso a ela. Resposta: sim, se a wiki
> estiver acessível sem controle — e ao verificar isso, achado real: zero
> autenticação no código-fonte do How to Dev. Mirror completo em
> `How to Dev/docs-frontend/seguranca/LOGS-DE-AUDITORIA.md` e
> `PROTECAO-DA-WIKI.md`.

## Achado 1: PaperTrail grava tudo, nada expõe

`ApplicationRecord` (api/) já tem `has_paper_trail` — toda mudança de
todo registro do projeto é gravada na tabela `versions` (`whodunnit`,
`item_type`/`item_id`, `event`, `object`, `created_at`) desde a primeira
migration. Confirmado por grep: zero controller da API expõe essa
tabela, zero feature do front tem tela de logs/auditoria. O dado existe,
ninguém consegue ver sem entrar direto no banco.

**Precisão importante, não confundir:** isso é diferente do gap de "log
de evento de segurança" (login falho, autorização negada) já documentado
na Fase 26. PaperTrail só grava mudança de **model** — login falho e
autorização negada nunca tocam um model, então nunca apareceriam em
`versions` mesmo com uma tela pra isso. São dois gaps distintos: um tem
dado e falta visualização (este), o outro nem tem dado gravado ainda
(o de segurança).

## Achado 2: How to Dev não tem autenticação nenhuma

Verificado no código-fonte do próprio `How to Dev` (`src/`): zero
`middleware.ts`, zero `AuthGuard`, zero NextAuth, zero checagem de senha.
Toda página é HTML completo desde a primeira resposta (lido direto do
markdown em disco). Uma wiki de segurança **sem controle de acesso**
entrega reconhecimento pronto pra quem tiver o link — os thresholds
exatos, a confirmação de gaps reais, tudo documentado de propósito pra
ser útil ao time.

**Por que o `AuthGuard` do `base-front` não serve de referência direta:**
`AuthGuard` é client-side (`useEffect`, checa `localStorage`) — funciona
no `base-front` porque o dado protegido só chega depois, via `fetch`
condicional client-side. No `How to Dev`, o conteúdo já está completo no
HTML da primeira resposta do servidor — um gate client-side não
protegeria nada (o navegador/crawler já recebeu tudo antes de qualquer
JS rodar). O mecanismo certo de referência é o `middleware.ts` do
`base-front` (server-side, intercepta antes da rota renderizar — hoje
com CSP, ver Fase 24), adaptado com outra lógica: checagem de
credencial, não geração de header. Como o `How to Dev` não tem base de
usuário própria, a recomendação documentada é HTTP Basic Auth via
`middleware.ts`, não replicar JWT/sessão do `base-front`.

## Ambos implementados, com aprovação explícita do usuário

Perguntado antes de construir (mesma régua de sempre pra build cruzando
repositório) — resposta: sim pros dois.

**Proteção da wiki:** `How to Dev/middleware.ts` novo, HTTP Basic Auth
contra `WIKI_BASIC_AUTH_USER`/`WIKI_BASIC_AUTH_PASS`, comparação
resistente a timing attack, falha fechada em produção sem credencial
configurada (libera só em dev local, pra não travar `next dev` sem env
var). Verificado ao vivo contra um build de produção real (`next start`
numa porta isolada, não a compartilhada) — 3 cenários: sem credencial
(401), credencial errada (401), credencial certa (200), com
`WWW-Authenticate` correto.

**Logs de auditoria:** `GET/GET-show /api/v1/admin/versions` na API +
`/logs`/`/logs/[id]` no front (rota própria pro detalhe, não modal).
Três bugs reais encontrados e corrigidos no processo, nenhum óbvio de
antemão:

1. Nomear arquivo/classe próprios `PaperTrail::Version::List` quebra o
   boot da aplicação inteira — Zeitwerk auto-vivifica `PaperTrail::Version`
   como módulo vazio a partir do caminho da pasta, antes da gem
   `paper_trail` carregar a classe real, e a gem quebra com `TypeError:
   Version is not a class`. Corrigido renomeando pra namespace próprio
   (`VersionLog::List`, `VersionLogSerializer`), sem tocar o caminho
   `PaperTrail::` pra arquivo nenhum nosso.
2. `render_success(data: @registro, ...)` no `show` não usa serializer
   customizado quando o nome da classe não bate com a convenção do
   ActiveModelSerializer — com `PaperTrail::VersionSerializer`
   deliberadamente não existindo (mesmo motivo do item 1), a resposta
   saía com `as_json` cru do ActiveRecord, todas as colunas sem filtro.
   Corrigido serializando explícito no controller
   (`VersionLogSerializer.new(@version).as_json`).
3. Teste de controller escrito com `get url, params: {...}, as: :json`
   pra um filtro de GET — `as: :json` manda os params como corpo JSON,
   não querystring, e a rota nunca casava (404 pelo catch-all). Bug de
   teste, não de rota/controller — corrigido usando querystring direta
   na URL, `as: :json` reservado pra corpo de POST/PATCH.

Os três gates obrigatórios de `api/CLAUDE.md` (`bin/rails test` 109/109,
`bin/rubocop` 145 arquivos limpos, `bin/brakeman --no-pager` 0 warnings)
passaram depois das correções. `public/swagger.yaml` e
`lib/tasks/gerar_postman.rb` não resolvem `versions` automaticamente (o
gerador assume `nome_recurso.singularize.camelize.safe_constantize`, que
falha pra um recurso namespaced/só-leitura) — as duas entradas foram
adicionadas à mão, mesmo formato do que o gerador produziria pros outros
recursos. Verificado ao vivo contra o dev server real da API (porta 3001,
já rodando) com JWT mintado via Rails console — `index`, `show` e filtro
por `event` todos testados com dado real (201 versões reais acumuladas
nesta sessão).

**Efeito colateral encontrado e corrigido junto:** o build do front
mostrava um aviso de depreciação do Next.js 16 (`middleware.ts` →
`proxy.ts`) que não tinha nada a ver com `versions`, mas que o
`AGENTS.md` deste projeto pede pra nunca ignorar. `front/middleware.ts`
renomeado pra `front/proxy.ts`, função `middleware` renomeada pra `proxy`
— aviso confirmado sumido no build depois. `How to Dev/middleware.ts`
**não** precisou do mesmo tratamento (build real verificado, sem aviso —
versão do Next é a mesma, mas o aviso não dispara lá).
