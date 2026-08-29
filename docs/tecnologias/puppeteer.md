# Puppeteer

**O que é:** biblioteca de automação de navegador headless (Chromium) — controla uma página real por código: abre URL, clica, preenche campo, tira screenshot, gera PDF, extrai HTML. É a escolha para automação por script e para geração de PDF de relatório.

**Por que essa:** quando o grupo precisa validar um fluxo inteiro pelo navegador (login → tela → submit) ou capturar o estado visual de uma página fora do Jest, o Puppeteer dá controle fininho do Chromium sem dependência de serviço externo. Alternativa de mercado é o Playwright — o `How to Dev` já traz `@playwright/test` em devDependencies como runner de e2e; Puppeteer entra como a opção de automação por script/node quando se quer só a API do Chromium (ex.: screenshot de relatório, crawler de página autenticada).

**Como importar:**

```bash
pnpm add puppeteer
```

```ts
import puppeteer from "puppeteer";
```

**Exemplo real** — gerar PDF de relatório a partir de HTML estável (`lib/server/relatorio-pdf/core.ts`):

```ts
import puppeteer, { type Browser } from "puppeteer";

// Browser vive entre requests — nunca fecha depois de um PDF, só a `page`
// (subir um Chromium novo por PDF seria caro). Fechar aqui quebraria o
// próximo relatório gerado.
let browserPromise: Promise<Browser> | null = null;
function getBrowser() {
  browserPromise ??= puppeteer.launch({ headless: true });
  return browserPromise;
}

const browser = await getBrowser();
const page = await browser.newPage();

try {
  await page.setContent(htmlDoRelatorio, { waitUntil: "load" }); // page.setContent() só aceita "load"/"domcontentloaded", não "networkidle0" (isso é só de page.goto())
  await page.emulateMediaType("print");

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", right: "10mm", bottom: "14mm", left: "10mm" },
  });
} finally {
  await page.close(); // só a page, nunca o browser
}
```

**Convenção do projeto:** PDF roda em Node.js, rota handler única e genérica (`app/api/relatorios/pdf/route.ts`), nunca em Client Component. A tela monta os dados do relatório (`RelatorioPdfDados`) e escolhe um estilo (`template`); a rota só escolhe o template certo e devolve `application/pdf` — o motor Puppeteer (este arquivo) não sabe nada de HTML/CSS de relatório, isso é cada `templates/*.ts`. Ver [`../ESTILOS-DE-PDF.md`](../ESTILOS-DE-PDF.md).
