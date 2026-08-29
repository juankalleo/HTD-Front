# Aparência avançada: overrides por cima do tema

> Como o admin controla fonte/cor específicas (sidebar, topbar, bordas,
> texto, tamanho de título) **sem trocar de tema** — cada override fica
> guardado num campo próprio em `c_configuracoes`, auditável como qualquer
> outro campo do model (`created_by`/`updated_by`/`PaperTrail`, já
> herdados de `ApplicationRecord`), e some sozinho (volta pro tema) se
> ficar sem valor.

## O princípio: override, nunca substituição do tema

Tema (`config.tema`) continua sendo a fonte de verdade de **tudo** que
essas telas não mexem. Os campos daqui só entram quando o admin
explicitamente define um valor — sem isso, sidebar/topbar/bordas/texto
seguem 100% o tema DaisyUI ativo, exatamente como antes de qualquer um
desses campos existir. É por isso que todo campo novo aqui é **nullable**
(exceto `tamanho_titulo_pagina`, ver abaixo) e o front trata `""` no
formulário como "sem override", nunca como um valor de verdade — normalizado
pra `NULL` no banco via `CConfiguracao#normalizar_overrides_de_estilo`
(`before_validation`), pra nunca cair um `""` bagunçando `inclusion`/`format`.

## Onde cada coisa é definida (código)

```
api/
  app/models/c_configuracao.rb          — OVERRIDES_ESTILO (lista dos nullable),
                                           TAMANHOS_TITULO_PAGINA, COR_HEX_REGEX,
                                           validação de cada campo, normalização "" → nil
  app/serializers/c_configuracao_serializer.rb  — expõe os campos
  app/controllers/.../c_configuracoes_controller.rb — permite os campos

front/
  services/api-institucional.ts          — tipo ConfiguracaoInstitucional (1 campo = 1 linha)
  theme/fonts.ts                          — cssVarDaFonte, cssVarDoTamanhoTitulo (lookup fechado)
  app/globals.css                         — --page-title-size (default), tokens de fonte
  app/layout.tsx                          — aplica os overrides GLOBAIS (borda/texto do
                                             sistema, tamanho de título) — só esses, porque
                                             só esses precisam estar certos desde o 1º paint
  shared/layout/app-sidebar.tsx           — aplica fonte/cor de SIDEBAR (escopado ao componente)
  shared/layout/app-header.tsx            — aplica fonte/cor de TOPBAR (escopado ao componente)
  shared/ui/tabelas/table.tsx             — aplica cor de borda de TABELA (mais específico
                                             que a borda geral do sistema)
  shared/ui/sistema/page-title.tsx        — <h1> padrão de toda tela (tamanho institucional)
  features/admin/config-institucional/
    schemas/aparencia.schema.ts           — validação do form (Zod, espelha a api/)
    components/aparencia-form.tsx         — telas "Sidebar e topbar" + "Sistema"
    components/estilo-sidebar-topbar-fields.tsx — os 2 campos reutilizáveis (fonte/cor)
```

Regra de organização: **cada override tem exatamente um lugar no front que
o aplica de verdade** (nunca dois componentes competindo pelo mesmo
CSS var), e o nome do campo é idêntico dos dois lados (`front` ↔ `api/`) —
achar "onde é definido" é sempre grep pelo nome do campo, nunca precisa
saber a história de como foi implementado.

## Duas técnicas diferentes, cada uma no lugar certo

**1. Override escopado a um componente** (fonte/cor de sidebar e topbar) —
aplicado via `style={{ ... }}` inline no próprio componente
(`app-sidebar.tsx`/`app-header.tsx`), lendo `useConfiguracaoInstitucional()`
direto. `style` inline sempre vence a classe Tailwind/DaisyUI por
especificidade, então isso funciona mesmo sem CSS var nenhuma:

```tsx
// shared/layout/app-sidebar.tsx
const corSidebar = config?.cor_sidebar || undefined;
// ...
<div className="... bg-base-100" style={{ backgroundColor: corSidebar }}>
```

Usado quando o override só faz sentido dentro de UM componente (não
existe "cor de sidebar" fora da sidebar).

**2. Override do token global** (borda do sistema, texto do sistema,
tamanho de título) — aplicado uma vez em `app/layout.tsx`, redefinindo o
mesmo CSS custom property que o DaisyUI já usa em **tudo**
(`--color-base-300`, `--color-base-content`), ou uma var própria do
projeto (`--page-title-size`):

```tsx
// app/layout.tsx
style={{
  ...(config.cor_borda_sistema ? { "--color-base-300": config.cor_borda_sistema } : {}),
  ...(config.cor_texto_sistema ? { "--color-base-content": config.cor_texto_sistema } : {}),
  "--page-title-size": cssVarDoTamanhoTitulo(config.tamanho_titulo_pagina),
}}
```

Usado quando o override precisa valer em **qualquer lugar** que use aquele
token — nenhum arquivo dos ~47 que usam `text-base-content` ou dos 14 que
usam `border-base-300` precisou mudar uma linha. Essa é a mesma técnica já
usada por `--font-sans`/`--app-scale` desde a Fase 11
([`CONFIGURACAO-INSTITUCIONAL.md`](CONFIGURACAO-INSTITUCIONAL.md)) — não é
padrão novo, é extensão do mesmo.

## Sidebar e topbar (fonte + cor)

| Campo | Onde aplica |
|---|---|
| `fonte_sidebar` | Texto geral da sidebar (nav) |
| `fonte_titulos_sidebar` | Nome do sistema (topo) + títulos de seção (PRINCIPAL, ADMINISTRAÇÃO...) |
| `fonte_topbar` | Topbar inteira |
| `cor_sidebar` | Fundo da sidebar |
| `cor_titulos_sidebar` | Nome do sistema (topo) + títulos de seção |
| `cor_rotas_sidebar` | Texto dos itens de navegação — **só no estado inativo**; o item ativo continua na cor `primary` do tema de propósito, é o sinal visual de "você está aqui" |
| `cor_topbar` | Fundo da topbar |

**Cuidado real, já testado**: se `cor_sidebar`/`cor_topbar` for escura e o
tema ativo for claro, o nome do sistema/títulos ficam ilegíveis a menos
que `cor_titulos_sidebar` também seja definida (`text-base-content` do
tema claro é escuro — texto escuro em fundo escuro). Corrigido nesse
componente aplicando `cor_titulos_sidebar` também ao nome do sistema, não
só aos títulos de seção. Não existe um equivalente pra topbar (usuário
logado/avatar) — não foi pedido um campo de cor de texto de topbar; se a
topbar for escura com tema claro, o nome do usuário pode ficar com baixo
contraste. Escolher um tema escuro junto resolve.

## Tamanho do título de página

Todo `<h1>` de tela usa `shared/ui/sistema/page-title.tsx`
(`<PageTitle>Usuários</PageTitle>`) em vez de repetir `className="text-2xl
font-bold text-base-content"` — era assim, idêntico, em ~28 arquivos antes
deste componente existir. `tamanho_titulo_pagina` (`xl`/`2xl`/`3xl`,
vocabulário fechado — cada valor é um `--font-size-*` real de
`app/globals.css`) controla o tamanho de **todas** de uma vez.

`--page-title-size` ainda multiplica por `--app-scale` (a escala do
sistema) por baixo dos panos, porque `--font-size-xl/2xl/3xl` já são
`calc(px * var(--app-scale))` — então o título continua acompanhando a
escala geral, só que a partir de um degrau de base escolhido à parte.

## Cor de borda (sistema + tabela) e cor de texto

`cor_borda_sistema` sobrescreve `--color-base-300` — vale pra todo
`border-base-300` do projeto (cards, divisores, borda de sidebar/topbar,
14 arquivos hoje). `cor_borda_tabela` é uma exceção **mais específica**:
quando definida, `shared/ui/tabelas/table.tsx` usa ela em vez de
`--color-base-300` (que pode já estar sobrescrita por `cor_borda_sistema`
— nesse caso tabela ainda pode ir além, se quiser uma cor diferente só
pra tabela).

`cor_texto_sistema` sobrescreve `--color-base-content` — vale pra
`text-base-content` **e** toda variação de opacidade (`text-base-content/
60`, `/50` etc.), porque no Tailwind v4 elas são
`color-mix(in oklab, var(--color-base-content) NN%, transparent)`: mudar a
cor base já muda a mistura, sem precisar de override por opacidade.
Confirma o que já era verdade antes deste campo existir: nenhum texto do
projeto tem cor hardcoded por arquivo — todo texto (título, corpo, texto
secundário cinza) já vinha de um token só, do tema. Este campo só permite
sobrescrever esse token único, não muda a arquitetura.

**Limite real, honesto**: `<input>`/`<select>`/`<checkbox>` do DaisyUI têm
borda própria (`--input-color`, uma mistura derivada de
`--color-base-content`, redeclarada dentro de cada regra `.input`/
`.select` do plugin) — não é `--color-base-300`. `cor_borda_sistema` não
alcança a borda de campo de formulário (é decisão de design do DaisyUI,
não bug deste projeto); `cor_texto_sistema`, por sua vez, muda a borda de
formulário como efeito colateral (já que `--input-color` deriva de
`--color-base-content`). Verificado direto no CSS gerado, não suposição.

## Checklist pra um override novo

1. Nullable (a menos que seja "sempre tem valor", como `tamanho_titulo_pagina`)
   + `format`/`inclusion` com `allow_nil: true` no model + entrar em
   `OVERRIDES_ESTILO` (normalização `"" → nil`).
2. Serializer + `permit` no controller.
3. `ConfiguracaoInstitucional` (front) + `CONFIGURACAO_PADRAO`.
4. Escopado a um componente → `style` inline nesse componente. Vale em
   qualquer lugar → redefine o token DaisyUI certo em `app/layout.tsx`
   (nunca um "if" espalhado por múltiplos arquivos).
5. Campo no form (`aparencia.schema.ts` + `aparencia-form.tsx`), reusando
   `FonteOverrideField`/`CorOverrideField` quando servir.
6. Documentar aqui — que token/componente ele toca, e qualquer limite real
   descoberto testando (como o de `--input-color` acima).
