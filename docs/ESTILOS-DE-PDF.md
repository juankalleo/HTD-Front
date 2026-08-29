# Estilos de PDF

> Como o sistema separa **dado** (qual relatório, quais campos) de
> **estilo** (como o PDF fica visualmente) — pra ter mais de um padrão
> visual de relatório sem duplicar o motor de geração. Ver também
> [`ESTILOS-DE-EXCEL.md`](ESTILOS-DE-EXCEL.md) — mesma arquitetura,
> segundo formato de export.

## A separação: dados × motor × estilo

```
lib/server/relatorio-pdf/
  types.ts               ← RelatorioPdfDados (contrato de DADOS, único, vale pra qualquer estilo)
  core.ts                ← MOTOR: Puppeteer, browser singleton, page.pdf() — não sabe nada de HTML/CSS de relatório
  html-utils.ts           ← escapeHtml/valorHtml, usados por todo template
  templates/
    simples.ts             ← ESTILO "simples": cartões de KPI + tabela, sem marca/assinatura
    institucional.ts        ← ESTILO "institucional": cabeçalho com marca, resumo, tabela, rodapé com emissor
  index.ts                ← ponto único de entrada: recebe (template, dados), monta o HTML, chama o motor
```

Um relatório novo **não escreve HTML/CSS**. Ele monta um `RelatorioPdfDados`
(mesma forma pra qualquer estilo — título, KPIs, colunas, linhas, filtros
aplicados, opcionalmente marca/emissor) e escolhe um `template` já pronto.
Um estilo novo (visual) entra como um arquivo a mais em `templates/`, sem
mexer no motor nem nos relatórios que já usam os outros estilos.

```ts
// services/api-relatorio-pdf.ts
export async function gerarRelatorioPdf(template: RelatorioPdfTemplateNome, dados: RelatorioPdfDados): Promise<Blob> {
  const response = await fetch("/api/relatorios/pdf", {
    method: "POST",
    body: JSON.stringify({ template, ...dados }),
  });
  return response.blob();
}
```

```ts
// lib/server/relatorio-pdf/index.ts
const TEMPLATES = { simples, institucional };

export async function gerarRelatorioPdfResponse(templateNome, dados) {
  const { montarHtml, opcoesPdf } = TEMPLATES[templateNome];
  return renderizarPdf(montarHtml(dados), dados.filename, opcoesPdf);
}
```

A rota (`app/api/relatorios/pdf/route.ts`) é **única e genérica** — não
existe mais uma rota por relatório. Ela exige sessão válida, valida a
forma inteira do corpo (Zod) e só então lê `{ template, ...dados }` e
delega pro dispatcher acima — detalhe completo (por que, e o teste real
feito contra a rota) em [`SEGURANCA-EXPORTACAO.md`](SEGURANCA-EXPORTACAO.md). Detalhe da
rota em si (por que é a única exceção a "sem `app/api/*`") em
[`relatorios/ARQUITETURA.md`](relatorios/ARQUITETURA.md#pdf-com-puppeteer--a-única-rota-em-app-api).

"Exportar PDF" nunca baixa direto no clique — navega pra uma **página**
própria de pré-visualização (`/relatorios/<relatorio>/pdf-preview`, não
modal — ver [`SEGURANCA-EXPORTACAO.md`](SEGURANCA-EXPORTACAO.md#5-preview-é-página-própria-não-modal)
pro porquê), que gera o PDF assim que monta e mostra num `<iframe>`. Cada
relatório tem o próprio par hook e página
(`features/relatorios/<relatorio>/hooks/use-relatorio-<relatorio>-pdf-preview.ts`,
`.../components/relatorio-<relatorio>-pdf-preview-page.tsx`) — nunca um
componente genérico escondendo como a rota protegida é chamada.

## Os estilos disponíveis

### `simples`

Cartões de KPI (grid) + tabela, nada mais — sem cabeçalho de marca, sem
rodapé de assinatura. Pro relatório rápido/interno, onde o peso visual do
`institucional` (abaixo) é desnecessário. Ignora `dados.marca`/
`dados.emissor` mesmo que venham preenchidos.

### `institucional`

Cabeçalho com marca do sistema (ícone + nome, vindos da Identidade
institucional — ver [`CONFIGURACAO-INSTITUCIONAL.md`](CONFIGURACAO-INSTITUCIONAL.md)),
barra de filtros ativos, cartões de resumo, tabela principal com zebra, e
um rodapé de fechamento com nota de geração + "Emitido por" (usuário
logado) + rodapé com marca/timestamp. É o estilo usado hoje pelo
[relatório de usuários](relatorios/usuarios.md).

**Inspirado no PDF do brasilconstroi** (`~/Documents/projetos/brasilconstroi`,
`app/views/layouts/relatorio_print.html.erb`/`pdf_detalhe.html.erb`) — mesma
paleta (slate + emerald, print-safe) e os mesmos blocos visuais (cartão de
resumo, cabeçalho de seção, tabela com zebra e totais, bloco de
fechamento). A fonte usa `wicked_pdf` (wkhtmltopdf); aqui é só o **estilo**
que foi trazido — o motor continua Puppeteer (`core.ts`), como todo PDF
deste projeto.

Duas diferenças deliberadas em relação à fonte, documentadas também no
topo de `templates/institucional.ts`:

1. **Sem "Assinado eletronicamente"** — vira só "Emitido por". Este
   relatório não passa por assinatura digital nenhuma, só rastreia quem
   clicou exportar (`dados.emissor`, o usuário logado). Dizer "assinado"
   seria inventar uma garantia que não existe.
2. **Sem texto de validade jurídica do documento** — vira uma nota neutra
   ("gerado automaticamente... com os dados disponíveis no momento da
   emissão"). É um relatório administrativo interno, não um documento
   oficial/contrato como no brasilconstroi.

## O contrato de dados (`RelatorioPdfDados`)

```ts
type RelatorioPdfDados = {
  filename: string;
  geradoEm: string; // ISO 8601
  title: string;
  subtitle?: string;
  marca?: { nome: string; iconeUrl?: string | null };      // opcional — só o "institucional" usa
  emissor?: { nome: string; contexto?: string };            // opcional — só o "institucional" usa
  filtros?: { label: string; value: string }[];
  kpis: { label: string; value: number | string }[];
  columns: { key: string; label: string; align?: "left" | "right" | "center" }[];
  rows: Record<string, string | number | null | undefined>[];
};
```

`marca`/`emissor` vêm de dado real já disponível no app — nunca inventados:

```ts
// features/relatorios/usuarios/hooks/use-relatorio-usuarios-pdf-preview.ts
const { user } = useSession();
const { data: config } = useConfiguracaoInstitucional();

marca: { nome: config?.nome_sistema ?? "Sistema", iconeUrl: urlAbsoluta(config?.icone_sistema_url ?? null) },
emissor: { nome: user.nome, contexto: [user.email, config?.a_tenant?.nome].filter(Boolean).join(" · ") },
```

## Adicionando um relatório que usa um estilo existente

1. Montar um `RelatorioPdfDados` com os campos **reais** do relatório
   (nunca inventar KPI/coluna que a API não devolve — mesma regra de
   [`relatorios/ARQUITETURA.md`](relatorios/ARQUITETURA.md), item 1 do
   checklist).
2. Escolher `"simples"` ou `"institucional"` — se nenhum servir
   visualmente, aí sim considerar um estilo novo (próxima seção).
3. Chamar `gerarRelatorioPdf(template, dados)` de
   `services/api-relatorio-pdf.ts` (ou uma função de conveniência
   específica do relatório, como `gerarRelatorioUsuariosPdf`).

## Adicionando um estilo novo

1. Novo arquivo em `lib/server/relatorio-pdf/templates/<nome>.ts`,
   exportando `{ montarHtml, opcoesPdf? }` (mesmo shape de
   `RelatorioPdfTemplate`, ver `types.ts`).
2. Registrar no mapa `TEMPLATES` de `lib/server/relatorio-pdf/index.ts` e
   no union type `RelatorioPdfTemplateNome` (`types.ts`).
3. HTML/CSS auto-contido no próprio arquivo do template (sem CSS externo,
   sem dependência de rede além de imagens absolutas tipo `marca.iconeUrl`)
   — o Puppeteer roda `page.setContent()` isolado, não tem acesso ao
   bundle CSS do Next.js.
4. Documentar aqui (nova seção em "Os estilos disponíveis") o que o estilo
   é, quando usar, e a fonte de inspiração visual se houver uma.
