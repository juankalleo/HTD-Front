# Administração e RBAC

> Documentação viva da Fase 5 do [`ROADMAP.md`](ROADMAP.md). O backend
> `api/` já tem RBAC granular pronto desde o Passo 1 do template
> (`a_papeis`/`a_permissoes`/`a_papeis_permissoes`/`a_usuarios_papeis`,
> ver `api/CLAUDE.md`) — esta fase é só **consumir** esse modelo no front,
> nunca inventar um sistema de papel paralelo.

## As quatro features, quatro rotas

| Feature | Rota | Recurso Rails |
|---|---|---|
| `features/admin/usuarios/` | `/usuarios` | `users` |
| `features/admin/tipos-usuario/` | `/tipos-usuario` | `a_tipos_usuario` |
| `features/admin/papeis/` | `/acessos/papeis` | `a_papeis` |
| `features/admin/permissoes/` | `/acessos/permissoes` | `a_papeis_permissoes` / `a_permissoes` |

`/acessos` sozinho é só um redirect pra `/acessos/papeis` — não é mais uma
tela própria (era, no desenho original; virou duas telas separadas depois
de feedback: "papéis" e "permissões" são conceitos diferentes o bastante
pra merecer rota própria cada um, e **recursos** (`a_recursos`) não tem
tela nenhuma — ver abaixo).

## Como o modelo real funciona (resumo pro front)

```
User ──< AUsuarioPapel >── APapel ──< APapelPermissao >── APermissao ── belongs_to ──> ARecurso
                │                                                  └── belongs_to ──> AAcao
                └── a_escopo_papel (Unidade/Órgão/Tenant/Plataforma)
```

- **`APermissao`** é a combinação `ARecurso × AAcao` (ex.: "User" ×
  "GERENCIAR"). `ARecurso.descricao` precisa ser o **nome exato da classe
  Ruby** (`ability.rb` resolve via `safe_constantize` — errar uma letra
  cadastra a permissão sem quebrar nada visivelmente, mas ela nunca concede
  acesso).
- **`APapelPermissao`** é o vínculo — um papel "tem" uma permissão.
- **`AUsuarioPapel`** vincula usuário a papel, com um escopo (de que nível
  da hierarquia tenant → órgão → unidade esse vínculo vale, ou "Plataforma"
  pra acesso irrestrito).

## Papéis (`/acessos/papeis`)

CRUD simples — `nome` + `descricao`, os dois `presence: true` no model real
(achado real: o schema Zod tinha `descricao` opcional por engano, corrigido
depois de conferir `APapel` — bug de verdade, o backend teria devolvido 422
num caso que o front deixava passar).

## Permissões (`/acessos/permissoes`)

**Não** é um cadastro de `APermissao` solto. É: escolher um papel
(`/acessos/permissoes` lista os papéis) → abrir a matriz recurso × ação
dele (`/acessos/permissoes/[id]`, `papel-permissoes-matrix.tsx`) → marcar
checkbox.

```tsx
async function alternar(recursoId, acaoId, recursoDescricao, acaoDescricao) {
  const permissao = encontrarPermissao(recursoId, acaoId);
  if (!permissao) {
    // combinação nova: cria a APermissao e já concede pro papel, num passo só
    const nova = await createPermissao(recursoId, acaoId, `${recursoDescricao} - ${acaoDescricao}`);
    conceder(nova.id);
    return;
  }
  const papelPermissao = encontrarPapelPermissao(permissao.id);
  if (papelPermissao) revogar(papelPermissao.id);
  else conceder(permissao.id);
}
```

Desmarcar só apaga o vínculo (`APapelPermissao`) — a `APermissao` em si
continua existindo (outro papel pode estar usando a mesma combinação
recurso×ação). `descricao` da `APermissao` é gerada automaticamente
(`"${recurso} - ${ação}"`) porque o model Rails exige presence nesse campo
e a matriz nunca pede esse texto pro usuário digitar.

## Recursos (`a_recursos`) — de propósito, sem tela

O front **não** cria nem edita `ARecurso`. Só lê (`useRecursos()`, read-only)
pra montar as linhas da matriz. Cadastro de recurso é tarefa do
programador, via console/seed da API — porque `descricao` precisa ser o
nome exato de uma classe Ruby real, e validar isso corretamente exigiria o
front conhecer a lista de classes do backend, o que não existe hoje como
endpoint. Errar essa string cadastrando pela UI cria uma permissão morta
sem nenhum erro visível — risco alto demais pra deixar num formulário
genérico.

## Tipos de usuário — dois hooks, dois propósitos

`ATipoUsuario` não entra no `ability.rb` (autorização é 100% via
papel/permissão) — é metadado descritivo (`admin`/`gestor`/`fornecedor`,
seed inicial). Por isso tem dois hooks (ver
[`DADOS-E-API.md`](DADOS-E-API.md#hooks-por-feature--a-camada-de-domínio)):
`useTiposUsuario()` sem paginação pro `<select>` de `usuario-form.tsx`, e
`useTiposUsuarioPaginado(page, busca)` pra tela `/tipos-usuario`.

## Usuário: `email` nunca aparece na listagem

`UserSerializer` (backend) devolve só `id, nome, a_tipo_usuario` — nunca
`email`, nem na resposta de listagem nem na de detalhe de admin (só no
login/sessão, via `CurrentUserSerializer`, que é sobre o **próprio**
usuário logado). Consequência real no front: o formulário de edição de
usuário não consegue pré-popular o campo e-mail com o valor atual — o campo
nasce vazio na edição, com label avisando ("deixe em branco pra manter o
atual" seria enganoso pro e-mail já que não há valor pra mostrar; o label
usado é neutro). Isso é limite real do contrato do backend, não bug do
front — documentado em comentário no `types/index.ts` da feature.
