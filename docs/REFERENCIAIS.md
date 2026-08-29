# Referenciais

> CRUDs padrão do admin trazidos da API real (`/api/v1/admin/*`) para o
> `base-front`. Esta área concentra cadastros de apoio usados por outros
> módulos: geografia, tenant, órgão, tipo de unidade e unidade.

## Recursos cobertos

| Tela | Rota front | Recurso Rails | Body |
|---|---|---|---|
| Países | `/referenciais/paises` | `g_pais` | `{ g_pais: { descricao, sigla } }` |
| Estados | `/referenciais/estados` | `g_estados` | `{ g_estado: { descricao, uf, g_pais_id } }` |
| Municípios | `/referenciais/municipios` | `g_municipios` | `{ g_municipio: { descricao, codigo_ibge, g_estado_id } }` |
| Tenants | `/referenciais/tenants` | `a_tenants` | `{ a_tenant: { nome } }` |
| Órgãos | `/referenciais/orgaos` | `a_orgaos` | `{ a_orgao: { nome, a_tenant_id } }` |
| Tipos de unidade | `/referenciais/tipos-unidade` | `a_tipos_unidade` | `{ a_tipo_unidade: { descricao } }` |
| Unidades | `/referenciais/unidades` | `a_unidades` | `{ a_unidade: { nome, a_orgao_id, a_tipo_unidade_id, g_municipio_id } }` |

Não entraram aqui `a_recursos`, `a_acoes`, `a_permissoes`,
`a_papeis_permissoes` e `a_usuarios_papeis`, porque esses são RBAC interno ou
já têm tela própria em [`ADMINISTRACAO-RBAC.md`](ADMINISTRACAO-RBAC.md).
`c_configuracoes` também fica fora: é configuração institucional, não
referencial.

## Estrutura no front

```
app/(admin)/referenciais/
  page.tsx
  [recurso]/page.tsx
  [recurso]/novo/page.tsx
  [recurso]/[id]/editar/page.tsx
features/admin/referenciais/
  config.ts
  components/
    referenciais-home.tsx
    referencial-list.tsx
    referencial-form.tsx
    referencial-create-page.tsx
    referencial-edit-page.tsx
  hooks/use-referenciais.ts
  schemas/referencial.schema.ts
  constants/query-keys.ts
  types/index.ts
```

A decisão foi fazer **um módulo genérico**, não sete features quase iguais. O
arquivo `config.ts` é a fonte única para cada cadastro: rota, título, resource
Rails, body key, campos, filtros, colunas e label de opção.

## Fluxo de dados

```ts
// features/admin/referenciais/config.ts
estados: {
  resource: "g_estados",
  bodyKey: "g_estado",
  searchParam: "q[descricao_or_uf_cont]",
  fields: [
    { name: "descricao", label: "Descrição", kind: "text" },
    { name: "uf", label: "UF", kind: "text" },
    { name: "g_pais_id", label: "País", kind: "select", source: "paises" },
  ],
}
```

O hook `useReferencialList` lê esse contrato e chama `useAdminList` com o
resource correto. O formulário usa o mesmo contrato para montar `defaultValues`,
schema Zod dinâmico e body da mutation. A rota continua fina: só valida o
`[recurso]` e renderiza o componente da feature.

## Filtros e selects

Campos relacionais usam os recursos da própria área como fonte de opção:

- Estado seleciona País.
- Município seleciona Estado.
- Órgão seleciona Tenant.
- Unidade seleciona Órgão, Tipo de unidade e Município.

Filtros seguem o padrão de [`TABELAS.md`](TABELAS.md): valor vazio significa
"todos" e não vai para a query string; valor preenchido vira `q[<campo>_eq]`.
Busca textual continua via Ransack (`q[descricao_cont]`, `q[nome_cont]`,
`q[descricao_or_uf_cont]`).

## Tabelas

Todas as listas de referenciais usam `DataTable` (`shared/ui/tabelas/data-table.tsx`), que combina:

- TanStack Table para estado e renderização.
- Primitivos `shared/ui/tabelas/table.tsx` no shape do shadcn/ui.
- Tailwind/DaisyUI tokens para cor, espaçamento e tema.

O mesmo `DataTable` também foi aplicado nas listas admin existentes
(`Usuários`, `Tipos de usuário`, `Papéis` e o picker de `Permissões`).

## Ajuste necessário na API

`AUnidade` exige `a_orgao_id` no controller, mas o serializer não devolvia
`a_orgao`. Isso impedia pré-selecionar o órgão na edição da unidade. O
serializer passou a devolver:

```rb
class AUnidadeSerializer < ApplicationSerializer
  attributes :id, :nome
  has_one :a_orgao
  has_one :a_tipo_unidade
  has_one :g_municipio
end
```

O teste `test/controllers/api/v1/admin/a_unidades_controller_test.rb` confirma
que `show` retorna o `a_orgao.id`.
