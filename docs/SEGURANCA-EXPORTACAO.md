# Segurança da exportação de relatório (PDF + Excel)

> `app/api/relatorios/pdf/route.ts` e `app/api/relatorios/excel/route.ts`
> são as únicas rotas deste projeto que montam um arquivo a partir de dado
> dinâmico pra devolver pro browser — é exatamente o tipo de lugar onde
> injeção, abuso de recurso e vazamento de rota costumam entrar. Este
> documento é o registro do que foi verificado (não só implementado — os
> pontos abaixo têm teste real feito contra as rotas rodando ou contra o
> arquivo binário gerado, não só leitura de código) e o porquê de cada
> decisão.

## Um arquivo por relatório/formato — organização como defesa

Cada exportação tem um arquivo próprio que mostra **exatamente** como a
rota protegida é chamada — nunca um componente genérico escondendo o
fluxo atrás de props soltas. Pra usuários:

```
features/relatorios/usuarios/
  hooks/
    use-relatorio-usuarios-pdf-preview.ts    ← como a rota de PDF é chamada pra ESTE relatório
    use-relatorio-usuarios-excel-preview.ts  ← como a rota de Excel é chamada pra ESTE relatório
  components/
    relatorio-usuarios-pdf-preview-page.tsx    ← a página em si (rota própria, não modal — ver seção 5)
    relatorio-usuarios-excel-preview-page.tsx
```

Um relatório novo (órgãos, unidades, o que vier) ganha o próprio par
hook+página — nunca reusa o de usuários por atalho. Isso é o que torna
auditável "esse relatório manda só dado real pro servidor, com token,
validado" sem precisar entender uma abstração genérica no meio: abre o
arquivo do relatório específico e o fluxo inteiro está ali.

## 1. Toda interpolação passa por escape — testado com payload de ataque real (PDF)

Nenhum template (`lib/server/relatorio-pdf/templates/*.ts`) interpola dado
dinâmico direto na string de HTML. Tudo passa por `escapeHtml`/`valorHtml`
(`lib/server/relatorio-pdf/html-utils.ts`) antes de entrar — título,
subtítulo, filtros, label/valor de KPI, label de coluna, valor de célula,
nome/URL de marca, nome/contexto de emissor. Zero exceção, checado nos
dois templates.

**Verificado ao vivo** (não só lido o código): POST direto pra rota com
`title`/`kpi.label`/`kpi.value`/`row` carregando `<script>alert(1)</script>`,
`<img src=x onerror=alert(1)>` e um `"><script>alert(2)</script>` (tentativa
clássica de escapar de um atributo). PDF gerado normalmente (200), sem
crash — e o texto malicioso aparece **literal**, como texto visível na
página, nunca executado (sem diálogo de alerta, sem imagem quebrada
tentando carregar, sem novo elemento renderizado). `escapeHtml` troca
`& < > " '`, que é exatamente o que impede as duas formas de fuga: fechar
uma tag (`<`/`>`) e fechar um atributo (`"`/`'`).

## 1b. Injeção de fórmula — ameaça específica de planilha (Excel)

PDF vira imagem/texto renderizado; Excel vira **dado que o programa do
usuário reprocessa ao abrir**. Uma célula começando com `=`, `+`, `-` ou
`@` pode ser interpretada como fórmula pelo Excel — um `nome` de usuário
tipo `=HYPERLINK("http://evil.com","clique")` executaria ao abrir o
arquivo, não é só texto na tela (CWE-1236, categoria própria, não coberta
pelo escape de HTML do PDF).

`lib/server/relatorio-excel/cell-utils.ts#valorCelulaSegura` prefixa `'`
(apóstrofo) em qualquer valor de célula que comece com um desses
caracteres antes de escrever no `Workbook` — o Excel trata isso como
"forçar texto", nunca calcula.

**Verificado no binário real, não só no código**: POST com `row.nome =
'=HYPERLINK("http://evil.com","clique")'` e `'@SUM(1+1)'`, arquivo `.xlsx`
gerado (200) descompactado (é um `.zip`) e `xl/sharedStrings.xml` lido
direto — os dois valores aparecem como `'=HYPERLINK(...)` e `'@SUM(1+1)`,
tipo `t="s"` (string), **sem** nenhum elemento `<f>` (fórmula) em lugar
nenhum do XML. Confirma que a defesa funciona no formato binário de
verdade, não só no código-fonte que a gerou.

## 2. Autenticação — nenhuma das duas rotas tinha antes do PDF

**Achado real (não hipotético):** até a primeira revisão de segurança,
`POST /api/relatorios/pdf` não conferia sessão nenhuma — qualquer
requisição que alcançasse o servidor Next.js gerava um PDF via Puppeteer,
autenticado ou não. Puppeteer é caro (processo Chromium, CPU/memória,
alguns segundos por request) — deixar isso aberto é abuso de recurso (DoS
barato) na cara, independente de qualquer payload malicioso no conteúdo.

Corrigido com `lib/server/auth-guard.ts#exigirSessaoValida`: exige header
`Authorization: Bearer <token>` e confirma contra `GET /auth/me` na api/
real (mesma fonte de verdade que `fetchCurrentUser` usa em qualquer outra
tela) antes de qualquer coisa. Em modo fake (sem `NEXT_PUBLIC_API_URL`),
aceita o mesmo `AUTH_FAKE_TOKEN` que o resto do app aceita nesse modo —
não fica nem mais nem menos permissivo que o resto do projeto. A rota de
Excel (`app/api/relatorios/excel/route.ts`) já nasceu usando a mesma
guarda — não reproduz o gap original.

**Verificado ao vivo, nas duas rotas**: POST sem header `Authorization` →
`401`. POST com token inventado (`Bearer garbage`) → `401` (confirma que
não é só "existe o header", é validado de verdade contra a api/). POST
com token real de sessão válida → `200`, arquivo de verdade.

`services/api-relatorio-pdf.ts#gerarRelatorioPdf` e `services/
api-relatorio-excel.ts#gerarRelatorioExcel` mandam o token
(`getAccessToken()`) em todo POST — sem isso, todo export quebraria com
`401`.

## 3. Validação do payload — Zod na fronteira, não só `as Tipo`

Antes, o corpo da requisição era só `(await request.json()) as
RelatorioPdfDados` — um cast de TypeScript, que não confere **nada** em
runtime. Qualquer payload malformado (tipo errado, campo faltando) passava
direto pros templates, que assumiam a forma certa — exceção não tratada =
500, ou pior, comportamento indefinido.

`lib/server/relatorio-pdf/request-schema.ts` e `lib/server/
relatorio-excel/request-schema.ts` (Zod, uma cópia por formato — mesma
disciplina de "arquivo específico" da seção acima) validam a forma inteira
antes de chamar qualquer template. `template` só aceita os valores reais
de cada formato — não existe fallback pra "template desconhecido", é
rejeitado com `400`.

**`filename` merece atenção especial**: vira o valor de um header HTTP
(`Content-Disposition: attachment; filename="..."`). `escapeHtml` (que
neutraliza HTML) **não protege header HTTP** — um `filename` com `\r\n`
poderia, em teoria, injetar headers novos na resposta (response
splitting). A defesa aqui não é escapar depois, é **rejeitar na
validação**: `filename` só aceita `/^[\w.-]+\.pdf$/` (PDF) ou
`/^[\w.-]+\.xlsx$/` (Excel) — qualquer `\r`/`\n`/espaço/barra nem passa do
Zod.

**Verificado ao vivo, nas duas rotas**: `filename` com `\r\nX-Injected:
evil` → `400`, rejeitado no Zod antes de qualquer header ser montado.
`template: "hackerman"` → `400` com a lista dos valores válidos no erro.

## 4. Sem download direto no clique

Nenhum "Exportar PDF"/"Exportar Excel" baixa arquivo no clique — os dois
navegam pra uma **página** de pré-visualização própria (ver seção 5) antes
de qualquer coisa ser salva no disco do usuário. O download em si só
acontece com um clique explícito ("Baixar PDF"/"Baixar Excel") dentro
dessa página.

Motivo duplo: (1) UX óbvia — ver o documento/planilha antes de decidir se
é o certo; (2) segurança prática — um arquivo gerado com dado
errado/inesperado (filtro errado, campo vazio) é pego na hora, antes de
virar um arquivo salvo e possivelmente compartilhado.

## 5. Preview é página própria, não modal

**Decisão corrigida em revisão** (a primeira versão usava modal — `<dialog
className="modal">` sobre a própria tela de listagem; trocado por rota
própria por pedido explícito, e porque uma página isolada é mais fácil de
auditar isoladamente do resto da tela — ver a seção anterior). Cada
relatório ganha duas rotas:

```
/relatorios/usuarios/pdf-preview?busca=...&tipo=...
/relatorios/usuarios/excel-preview?busca=...&tipo=...
```

Os filtros atuais da listagem vão na **query string** — bookmarkável,
recarregável, nada de estado passado escondido entre componentes. A
página lê os filtros (`useSearchParams`), refaz a busca dos dados
filtrados e chama a rota protegida sozinha (ver seção "Um arquivo por
relatório/formato" acima).

PDF e Excel têm UX de preview **deliberadamente diferentes**: PDF só tem
visualizador nativo de verdade depois de gerado (a página mostra
"Gerando PDF..." e chama a rota assim que monta, depois renderiza num
`<iframe>`); Excel não tem visualizador nativo de `.xlsx` no browser, e
parsear de volta um arquivo que a gente acabou de montar seria
desperdício — a página de preview do Excel mostra a **tabela dos dados de
origem** direto (sem chamar a rota), e só chama `POST
/api/relatorios/excel` quando o usuário confirma "Baixar Excel".

## O que isso NÃO cobre (limite real, não escondido)

- **Rate limiting.** As duas rotas vivem no processo Next.js, fora do
  `rack-attack` que protege a api/ Rails (ver `api/CLAUDE.md`, 0.9). Um
  usuário autenticado ainda pode gerar arquivos em sequência rápida — a
  autenticação (item 2) fecha o abuso *anônimo*, não o de um usuário
  legítimo automatizando requisições. Não implementado agora por falta de
  cache compartilhado (Redis) disponível no front; se isso virar problema
  real, entra como item novo, não suposição.
- **Sandbox do Chromium (só PDF).** `puppeteer.launch({ headless: true })`
  não desliga o sandbox padrão (`--no-sandbox` nunca é passado) nem expõe
  binding nenhum de Node pro contexto da página (`page.exposeFunction`
  nunca é chamado) — mesmo que uma string escapasse do escape (item 1) e
  executasse JS dentro da página renderizada, não haveria ponte pro
  processo host. Isso é uma característica de como o motor já está
  configurado, não uma camada extra adicionada — vale saber que existe,
  mas a defesa real continua sendo o escape do item 1. Excel não roda
  processo externo nenhum (ExcelJS é puro Node), esse item não se aplica
  a ele.
