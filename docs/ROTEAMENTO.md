# Roteamento — auditoria contra projetos irmãos

> `lib/routes.ts` centraliza toda URL navegável do projeto em helpers
> nomeados no estilo Rails (`_path`, `new_`/`edit_`, prefixo de módulo de
> 1 letra). Este documento registra a auditoria feita comparando esse
> padrão contra três projetos irmãos reais que usam o mesmo template de
> backend Rails: `frotas-mvc`, `nextfrotas-api` e `nextfrotas-combustivel`
> (`~/Documents/projetos/frotas/frotas-mvc/`). Mirror completo, em tom de
> referência (sem o histórico de fase), em
> `How to Dev/docs-frontend/ROTEAMENTO.md`.

## Achado principal: `lib/routes.ts` já está à frente dos dois irmãos

- **`nextfrotas-combustivel`** (produto Next.js real em produção) **não
  tem helper de rota nenhum** — toda navegação é string literal
  (`router.push("/motorista/bdt?autorizacao_tipo=padrao")`,
  `router.push("/admin")`) espalhada por ~10 arquivos.
- **`frotas-mvc`** usa `resources` com prefixo de módulo (mesma
  convenção), mas a seção de relatórios cresceu sem nesting — ~90 rotas
  nomeadas na mão (`relatorios_ordens_servico_fornecedor_pdf`,
  `relatorios_bdts_gestor_prestacao_print`...) em vez de um bloco
  `member`/`collection`.
- **`base-front`**: confirmado por agente de exploração (grep completo) —
  toda página em `app/` (29 rotas) tem helper correspondente em `ROUTES`,
  e **zero** arquivo do projeto usa string literal de rota fora de
  `lib/routes.ts`/seu teste. Nenhuma mudança de código foi necessária —
  a auditoria não achou gap real na implementação atual, só na
  **documentação** do padrão (dois casos de uso que já eram suportados
  pela estrutura do arquivo, mas nunca tinham nome/convenção escrita).

## `m_` validado por precedente real

Antes desta auditoria, o prefixo `m_` (`m_usuarios_path`) só estava
documentado como escolha própria do front ("usuários/membros do
sistema"), sem validação externa. Achado real: `frotas-mvc/config/
routes.rb` tem `resources :users, path: 'm_usuarios', as: :m_usuarios` —
o mesmo prefixo, pro mesmo model `User`/`users` sem prefixo no backend
(a exceção documentada no template), decidido de forma independente num
projeto irmão de verdade. Cogitei renomear pra tirar o `m_` (já que
`users` não tem prefixo no backend `api/` deste projeto) antes de achar
essa evidência — decisão final: manter, com o precedente registrado.

## Convenção nova documentada, sem código novo: ação de verbo

`nextfrotas-api` (`member { patch :validar_voucher; patch :cancelar }`) e
`frotas-mvc` (`member { post :aprovar }`) usam um padrão de rota que o
`base-front` ainda não tinha nomeado: ação de verbo sobre um membro ou
coleção (aprovar/cancelar/validar), diferente de novo/editar. Documentado
em `ROTEAMENTO.md` (How to Dev) como `<verbo>_<modulo>_<recurso>_path(id)`
— verbo antes do módulo, mesma posição de `new_`/`edit_`. Nenhum helper
novo entrou em `lib/routes.ts`: não existe hoje nenhuma rota desse tipo no
projeto (todo fluxo é CRUD puro), e a função genérica `memberPath` já
existente cobre a montagem sem precisar de código novo
(`` `${memberPath(base, id)}/aprovar` ``) — só faltava o nome
convencionado pra quando a primeira aparecer.

## `a_papel_permissoes_path` — drift aparente, na verdade intencional

O agente de exploração flagueou como possível inconsistência: o helper
recebe `id` de **papel**, mas a URL real é `/acessos/permissoes/:id`.
Investigado antes de mexer — é intencional: o nome descreve a relação
("permissões deste papel"), não o formato da URL, porque isso é mais
claro nos dois call sites (`papeis-list.tsx`, `permissoes-papeis-list.tsx`)
do que o nome Rails-literal (`a_permissao_path(id)`, que esconderia que o
`id` é de papel). Documentado como exceção deliberada, não corrigido.

## Resumo

| Achado | Ação |
|---|---|
| Zero rota sem helper, zero string literal de rota | Nenhuma — já correto |
| `m_usuarios_path` sem prefixo no backend | Mantido — precedente real em `frotas-mvc` |
| Ação de verbo (aprovar/cancelar) sem convenção nomeada | Documentado; sem código (sem caso de uso ainda) |
| `frotas-mvc`: ~90 rotas de relatório sem nesting | Documentado como anti-padrão a evitar em `relatorios_*` |
| `a_papel_permissoes_path` nomeia pela relação, não pela URL | Documentado como intencional, não corrigido |
