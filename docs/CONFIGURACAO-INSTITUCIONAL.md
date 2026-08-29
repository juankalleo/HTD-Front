# Configuração institucional

> Documentação viva de uma fase nova, que não estava no
> [`ROADMAP.md`](ROADMAP.md) original — surgiu do pedido de dar ao admin
> controle sobre tema/marca/tamanho do sistema **pra todo mundo**, não só
> uma preferência pessoal de quem mexeu.

## O problema que isso resolve

O tema pessoal (`/config`, `features/sistema/temas/`) já existia e é 100%
client-side: fica salvo no `localStorage` de quem trocou, então só afeta o
próprio navegador de quem mexeu. Pra existir um "padrão institucional"
(tema, fonte, nome, ícone e imagem de fundo do login que **todo mundo** vê
por padrão), o valor precisa vir de algum lugar compartilhado — um
backend. Não existe outro jeito: sem persistência no servidor, "configurar
pra todo mundo" nunca sai da tela de quem configurou.

## Backend: `c_configuracoes`, um por tenant

Módulo novo (prefixo `c_`, nunca usado antes — `a_` já é "Acesso"), gerado
com `bin/rails g api_scaffold` igual qualquer outro recurso admin
(`api/CLAUDE.md`, regra 1). Um registro por `a_tenant`
(`validates :a_tenant_id, uniqueness: true`).

Campos com vocabulário fechado (`tema`, `fonte`) usam constante Ruby +
`inclusion`, não tabela de referência (regra 2 do `api/CLAUDE.md` mira enum
de *negócio*; aqui o dono do vocabulário é o bundle CSS/fontes do front, não
um dado que o admin cadastra):

```ruby
# api/app/models/c_configuracao.rb
TEMAS = %w[light dark corporate business].freeze
FONTES = %w[geist inter roboto open-sans lato montserrat poppins source-sans nunito work-sans rubik raleway ibm-plex-sans].freeze
ESCALAS = [90, 100, 110, 125, 150, 175, 200, 225, 250].freeze
LARGURA_SIDEBAR_RANGE = (220..360).freeze
ALTURA_TOPBAR_RANGE = (48..88).freeze
```

`largura_sidebar`/`altura_topbar` são faixa numérica (`numericality: in:`),
não lista fechada — são arrastáveis livremente (ver "Arrastar sidebar e
topbar" abaixo), então qualquer valor dentro da faixa é válido, não só
alguns pontos fixos.

`imagem_fundo_login`/`icone_sistema` são `has_one_attached` (ActiveStorage).
O serializer devolve só o **path** do blob (`rails_blob_path(..., only_path:
true)`), nunca URL absoluta — a API não tem host fixo configurado
(`Rails.application.routes.default_url_options`), e o front já sabe montar
URL absoluta prefixando com `NEXT_PUBLIC_API_URL`, igual todo outro
endpoint.

> **Se a imagem aparecer quebrada no navegador** (arquivo salvo, mas a URL
> 404): não é o front nem o upload/recorte (`UPLOAD-DE-IMAGEM.md`) — já foi
> exatamente isso uma vez, causa era 100% backend (um `match "*unmatched"`
> catch-all em `config/routes.rb` interceptando as rotas do ActiveStorage
> antes delas existirem). Corrigido — detalhe completo, e como a API separa
> upload local de upload em bucket (S3, pronto mas não ativo), em
> `api/docs/UPLOAD-DE-ARQUIVO.md`.

### O endpoint público: `GET /api/v1/c_configuracoes/atual`

Fora do namespace `/admin`, com `skip_before_action :authenticate_user!` —
a tela de **login** (antes de autenticar) precisa saber tema/nome/ícone/
fundo antes de existir sessão nenhuma.

Resolução: pelo tenant do usuário logado, se houver sessão válida com
`a_unidade` preenchida; sem sessão (tela de login) ou usuário sem tenant
resolvível (ex.: admin de escopo Plataforma), cai pro primeiro tenant
cadastrado.

> **Simplificação assumida, não escondida**: este template assume 1 tenant
> "ativo" por deploy pra fins de branding pré-login. Um produto que sirva
> várias marcas na mesma tela de login resolveria isso pelo host da
> requisição (subdomínio/slug) — não implementado aqui porque não foi
> pedido e adicionaria uma camada de roteamento que este chassi não tem.

## Front: aplicado no servidor, sem flash

`app/layout.tsx` é um Server Component **assíncrono** — busca a config
institucional no servidor a cada request (`fetchConfiguracaoInstitucional`,
`cache: "no-store"`) e já renderiza o HTML com o valor certo:

```tsx
export default async function RootLayout({ children }) {
  const config = await fetchConfiguracaoInstitucional();
  return (
    <html
      data-theme={config.tema}
      style={{
        "--font-sans": cssVarDaFonte(config.fonte),
        "--app-scale": fatorDaEscala(config.escala),
        "--sidebar-width": `${config.largura_sidebar}px`,
        "--topbar-height": `${config.altura_topbar}px`,
      }}
    >
```

Consequência real: **todo o app virou dynamic rendering** (nenhuma página
mais é prerenderizada estática) — porque o layout raiz, que envolve tudo,
faz fetch sem cache a cada request. Trade-off aceito de propósito: é um
sistema interno (não uma página pública que precise de CDN estático), e
branding tem que refletir mudança do admin na hora, não um snapshot de
build.

O tema **pessoal** (`/config`) continua podendo sobrescrever por cima — o
script inline de tema (`app/layout.tsx`) só troca o `data-theme` se existir
escolha salva no `localStorage`; sem escolha pessoal, o institucional
prevalece.

## Escala: do conteúdo, não do shell

`--app-scale` multiplica `--spacing` (base de todo `p-*`/`gap-*`/`w-*` do
Tailwind) e `--font-size-*` — cresce/encolhe texto e espaçamento juntos,
em todo lugar que usa esses tokens. **Menos** dentro da sidebar e da topbar,
que têm o próprio tamanho (arrastável, ver abaixo) e ficariam quebradas
(conteúdo maior que o container) se também respondessem à escala. Fix:
`AppSidebar`/`AppHeader` fixam `--app-scale: 1` no próprio elemento raiz —
CSS custom property em cascata, então todo `calc(base * var(--app-scale))`
dentro deles resolve como se a escala institucional fosse sempre 100%,
independente do que o `<html>` diz.

```tsx
// shared/layout/app-sidebar.tsx
<div className="..." style={{ "--app-scale": 1 } as CSSProperties}>
```

## Arrastar sidebar e topbar

Tela **Aparência** (`/config-institucional/aparencia`) tem uma maquete do
shell (`AppShellPreview`) com duas alças arrastáveis — uma na borda da
sidebar (largura, 220-360px), outra na borda da topbar (altura, 48-88px).
Implementado com Pointer Events puro (`onPointerDown/Move/Up` +
`setPointerCapture`), sem lib de drag — a interação é simples o bastante
(1 eixo por alça, sem colisão entre elementos) pra não justificar
dependência nova. Suporta teclado também (setas, com a alça focada) pra não
ficar mouse-only.

## As duas telas

| Rota | Edita |
|---|---|
| `/config-institucional/aparencia` | tema, fonte, escala, largura da sidebar, altura da topbar, e os overrides avançados (fonte/cor de sidebar e topbar, tamanho de título, cor de borda/texto — ver [`APARENCIA-AVANCADA.md`](APARENCIA-AVANCADA.md)) |
| `/config-institucional/identidade` | nome do sistema, ícone (ao lado do nome no menu lateral — também usado como favicon), imagem de fundo do login |

Os dois formulários buscam o registro pelo **mesmo** endpoint público
(`GET /atual`, autenticado dessa vez — resolve pelo tenant de quem está
logado) pra descobrir o `id` a editar, e mandam `PATCH
/api/v1/admin/c_configuracoes/:id`. Se `atual` devolver `id: null`
(nenhuma config cadastrada pra nenhum tenant ainda — instalação nova), a
tela mostra aviso em vez de tentar salvar num id inexistente; criar a
primeira config de um tenant não tem UI própria ainda (fica pro
console/seed, igual `db:seed` já bootstrapa o resto).

`icone_sistema`/`imagem_fundo_login` (tela Identidade) não aceitam
qualquer arquivo direto — cada um tem proporção e tamanho máximo fixados em
código, e o admin recorta/posiciona a imagem antes de enviar. Padrão
completo (biblioteca, componente, convenção pra campo de imagem novo) em
[`UPLOAD-DE-IMAGEM.md`](UPLOAD-DE-IMAGEM.md).
