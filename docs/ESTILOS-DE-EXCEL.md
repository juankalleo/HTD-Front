# Estilos de Excel

> Mesmo princípio de [`ESTILOS-DE-PDF.md`](ESTILOS-DE-PDF.md) — separa
> **dado** (qual relatório, quais campos) de **estilo** (como a planilha
> fica visualmente), pra ter mais de um padrão visual sem duplicar o
> motor de geração. Formato diferente, mesma arquitetura de propósito —
> quem já entende um entende o outro.

## Por que ExcelJS

Vocabulário de tecnologia único usado neste projeto pra gerar `.xlsx`:
`exceljs` (`^4.4.0`). A alternativa mais popular do ecossistema,
`xlsx`/SheetJS, tem a licença "Community Edition" no npm sem suporte a
**estilo de célula** (cor, negrito, borda) na escrita — só a versão paga
("Pro") escreve isso. Como este projeto quer a mesma identidade visual
(cores, cabeçalho colorido, zebra) que já existe no PDF institucional,
`exceljs` é a escolha certa: 100% open source, mantido ativamente, e
`Workbook`/`Worksheet` têm API completa de estilo (`font`, `fill`,
`border`, `alignment`) nativa, sem paywall.

## A separação: dados × motor × estilo

```
lib/server/relatorio-excel/
  types.ts               ← RelatorioExcelDados (contrato de DADOS, único, vale pra qualquer estilo)
  core.ts                ← MOTOR: ExcelJS puro Node (sem processo externo), Workbook → buffer .xlsx
  cell-utils.ts           ← valorCelulaSegura — defesa contra injeção de fórmula, ver docs/SEGURANCA-EXPORTACAO.md
  templates/
    simples.ts             ← ESTILO "simples": título + tabela, sem marca/KPI/rodapé
    institucional.ts        ← ESTILO "institucional": marca, filtros, KPIs, tabela com zebra, rodapé com emissor
  index.ts                ← ponto único de entrada: recebe (template, dados), monta o Workbook, chama o motor
```

`RelatorioExcelDados` é um tipo **separado** de `RelatorioPdfDados` (não
compartilhado) — cada formato de export tem seu módulo completo (motor,
tipos, templates) próprio, pra "onde é Excel" e "onde é PDF" nunca
dependerem de saber que um reusa o tipo do outro por baixo dos panos. As
duas formas têm o mesmo shape hoje (mesmo dado, dois formatos de saída),
mas são livres pra divergir se um formato precisar de um campo que o
outro não faz sentido ter.

```ts
// lib/server/relatorio-excel/index.ts
const TEMPLATES = { simples, institucional };

export async function gerarRelatorioExcelResponse(templateNome, dados) {
  const { montarWorkbook } = TEMPLATES[templateNome];
  const workbook = montarWorkbook(dados);
  return renderizarExcel(workbook, dados.filename);
}
```

A rota (`app/api/relatorios/excel/route.ts`) é a segunda exceção ao "sem
`app/api/*`" deste projeto (a primeira é `relatorios/pdf`) — mesma guarda
de sessão (`exigirSessaoValida`) e mesma disciplina de validação (Zod
antes de qualquer template rodar). Detalhe completo em
[`SEGURANCA-EXPORTACAO.md`](SEGURANCA-EXPORTACAO.md).

Nenhuma tela baixa o `.xlsx` no clique — navega pra uma página de preview
própria por relatório (`features/relatorios/<relatorio>/components/
<relatorio>-excel-preview-page.tsx`), que mostra os **dados de origem**
numa tabela (sem gerar o arquivo ainda) e só chama a rota quando o admin
confirma "Baixar Excel". Ver
[`SEGURANCA-EXPORTACAO.md`](SEGURANCA-EXPORTACAO.md#5-preview-é-página-própria-não-modal)
pro porquê dessa página existir separada do PDF (preview de dado, não de
arquivo binário) e por que é página, não modal.

## Os estilos disponíveis

### `simples`

Título + tabela, nada mais — sem marca, sem KPI, sem rodapé de emissor.
Par conceitual do `simples` de PDF. Ignora `dados.marca`/`dados.emissor`/
`dados.kpis` mesmo que venham preenchidos.

### `institucional`

Cabeçalho com marca do sistema (só o nome — ver "Sem imagem embutida"
abaixo), filtros ativos (célula com fundo amarelo, mesma cor do PDF),
cartões de KPI (linha label + linha valor, uma coluna por KPI), tabela
principal com cabeçalho `slate-800`/texto branco e zebra `slate-100`, e
uma linha final "Emitido por" com nome + contexto do usuário logado.
Mesma paleta do template PDF homônimo — quem abre os dois formatos do
mesmo relatório reconhece a mesma identidade visual. É o estilo usado
hoje pelo [relatório de usuários](relatorios/usuarios.md).

**Sem imagem embutida (diferença deliberada do PDF):** o PDF institucional
mostra o ícone do sistema (`marca.iconeUrl`, um `<img>` no HTML);
`RelatorioExcelDados.marca` só tem `nome`, sem `iconeUrl`. Embutir imagem
numa planilha via ExcelJS (`workbook.addImage`) exigiria buscar os bytes
do ícone no servidor a cada exportação — complexidade extra pra um
formato que é primariamente uma ferramenta de dado, não de marca visual
(diferente do PDF, que costuma ser compartilhado/impresso como documento).
Decisão de escopo, não limitação técnica do ExcelJS (que suporta imagem
embutida perfeitamente).

## O contrato de dados (`RelatorioExcelDados`)

```ts
type RelatorioExcelDados = {
  filename: string; // termina em .xlsx, validado no Zod da rota
  geradoEm: string; // ISO 8601
  title: string;
  subtitle?: string;
  marca?: { nome: string };
  emissor?: { nome: string; contexto?: string };
  filtros?: { label: string; value: string }[];
  kpis: { label: string; value: number | string }[];
  columns: { key: string; label: string; align?: "left" | "right" | "center" }[];
  rows: Record<string, string | number | null | undefined>[];
};
```

## Adicionando um relatório que usa um estilo existente

1. Montar um `RelatorioExcelDados` com os campos **reais** do relatório
   (mesma regra do PDF — nunca inventar KPI/coluna que a API não devolve,
   ver [`relatorios/ARQUITETURA.md`](relatorios/ARQUITETURA.md)).
2. Escolher `"simples"` ou `"institucional"` — se nenhum servir
   visualmente, aí sim considerar um estilo novo (próxima seção).
3. Criar o par hook + página de preview específico do relatório (ver
   [`SEGURANCA-EXPORTACAO.md`](SEGURANCA-EXPORTACAO.md), "Um arquivo por
   relatório/formato") — nunca reusar o hook/página de outro relatório.

## Adicionando um estilo novo

1. Novo arquivo em `lib/server/relatorio-excel/templates/<nome>.ts`,
   exportando `{ montarWorkbook }` (mesmo shape de
   `RelatorioExcelTemplate`, ver `types.ts`).
2. Registrar no mapa `TEMPLATES` de `lib/server/relatorio-excel/index.ts`
   e no union type `RelatorioExcelTemplateNome` (`types.ts`).
3. Todo valor de célula vindo de `dados.rows`/`dados.columns` passa por
   `valorCelulaSegura` (`cell-utils.ts`) — nunca escrever `cell.value =
   row[coluna.key]` direto, é a defesa contra injeção de fórmula (ver
   [`SEGURANCA-EXPORTACAO.md`](SEGURANCA-EXPORTACAO.md#1b-injeção-de-fórmula--ameaça-específica-de-planilha-excel)).
4. Documentar aqui (nova seção em "Os estilos disponíveis") o que o
   estilo é, quando usar.
