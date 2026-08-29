# Contexto do projeto

> Este arquivo existe para dar contexto rápido a quem (ou qual IA) pegar esse
> projeto depois. Leia antes de sugerir arquitetura ou mexer na estrutura.

## O que é isso aqui

`base-front` é o ponto de partida do **front-end real** de uma iniciativa maior
de padronização técnica. Hoje (2026-08-26) ele é literalmente só o scaffold
padrão do `create-next-app` — App Router, TypeScript, Tailwind v4, ESLint,
pnpm — **sem nenhuma decisão de arquitetura ainda tomada**. Nada aqui deve ser
lido como "já é o padrão"; é o ponto zero.

A ideia é usar este projeto para **estruturar, na prática, o padrão de
front-end** que depois vira referência para os outros times/projetos. Ou seja:
as decisões de pasta/camadas/convenções vão sendo tomadas *aqui*, ao construir
de verdade, e não definidas antes no vácuo.

## O projeto irmão: `How to Dev`

No mesmo diretório raiz (`../How to Dev`) existe outro projeto Next.js, que é o
**site de documentação** desses padrões — front-end, API, infraestrutura e
exemplos (ver os itens do navbar: "Padrão Frontend", "Padrão API", "Padrão
Infraestrutura", "Exemplos"). Ele também está numa fase inicial: até
2026-08-26 ele era essencialmente um mockup visual montado em cima de uma
página real de terceiros (o blog da metodologia Feature-Sliced Design,
`feature-sliced.design`), usado só para ter uma referência de layout
(navbar, sidebar de conteúdo tipo Confluence, artigo, glossário/TOC).

Esse mockup acabou de passar por uma limpeza (ver
`../How to Dev/docs/SOURCE.md` para o histórico completo):

- Título, autor, metatags, JSON-LD e todos os links reais que apontavam para
  `feature-sliced.design` (Discord, GitHub, Twitter, etc. deles) foram
  removidos ou trocados por `#`.
- Tudo que ainda é placeholder está marcado explicitamente com `[MOCK]` /
  `(mock)` no título, no autor, num banner no topo do artigo e nos badges da
  sidebar e do glossário.
- O texto do corpo do artigo **não foi reescrito frase a frase** — foi mantido
  como esqueleto de layout (títulos, parágrafos, imagens, lista, tabela) só
  para não perder a referência visual. Isso ainda é conteúdo de terceiro e
  precisa ser substituído pelo conteúdo real do padrão quando chegar a hora.
- O script que sincronizava a página ao vivo com `feature-sliced.design`
  (`scripts/sync-feature-sliced-page.mjs`) foi desativado (removido do
  `package.json`) para não sobrescrever essa limpeza sem querer.

**Importante para quem ler isso depois:** o `How to Dev` não representa nosso
padrão real ainda. É só a casca estrutural (layout/UX) que vai sendo
preenchida com conteúdo verdadeiro conforme o `base-front` for ganhando forma.

## Fluxo de trabalho esperado daqui pra frente

1. Estruturar o `base-front` de verdade — camadas, convenções, organização de
   pastas, padrões de componente/rota/dados etc.
2. Cada decisão relevante de arquitetura vira documentação em **dois
   lugares ao mesmo tempo**:
   - Aqui em `base-front/docs/` — documentação técnica próxima do código.
   - Em `How to Dev` — substituindo, seção por seção, o conteúdo `[MOCK]` pelo
     conteúdo real do padrão (mesma estrutura de navbar/sidebar que já existe
     lá, só trocando o miolo).
3. O `How to Dev` é o produto final voltado a documentar o padrão para o time;
   o `base-front` é onde o padrão é validado na prática antes de virar
   documentação.

## Coisas que já foram decididas

- Gerenciador de pacotes: `pnpm` (mesmo do `How to Dev`, via corepack).
- Next.js App Router + TypeScript + Tailwind v4 + ESLint (defaults do
  `create-next-app`, nada customizado ainda).

## Coisas que NÃO foram decididas ainda

- Qual metodologia/estrutura de pastas vai ser o padrão (Feature-Sliced
  Design foi só a referência visual usada no mockup do `How to Dev` — não é
  uma decisão confirmada de arquitetura para o `base-front`).
- Qualquer coisa de componentes, design system, data layer, testes, etc.

Se você é uma IA lendo isso pela primeira vez: não assuma nenhuma arquitetura
pronta. Pergunte ou proponha, mas trate este repo como ponto de partida em
branco.
