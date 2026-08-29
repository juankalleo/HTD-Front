import puppeteer, { type Browser } from "puppeteer";
import { NextResponse } from "next/server";
import { escapeHtml } from "./html-utils";
import type { RelatorioPdfOpcoes } from "./types";

/**
 * Motor de PDF — só sabe transformar HTML/CSS pronto em bytes de PDF via
 * Puppeteer. Não sabe nada sobre KPI/tabela/relatório: isso é
 * responsabilidade de cada `templates/*.ts`. Um browser Chromium só, reusado
 * entre requisições (subir um processo novo por PDF seria caro).
 */
let browserPromise: Promise<Browser> | null = null;

function getBrowser() {
  browserPromise ??= puppeteer.launch({ headless: true });
  return browserPromise;
}

const MARGEM_PADRAO = { top: "12mm", right: "10mm", bottom: "14mm", left: "10mm" };

export async function renderizarPdf(html: string, filename: string, opcoes: RelatorioPdfOpcoes = {}): Promise<NextResponse> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // `setContent` só aceita "load"/"domcontentloaded" nesta versão do
    // Puppeteer (25.x) — "networkidle0" é válido em `page.goto()`, não aqui.
    await page.setContent(html, { waitUntil: "load" });
    await page.emulateMediaType("print");

    const pdf = await page.pdf({
      format: "A4",
      landscape: opcoes.landscape ?? false,
      printBackground: true,
      margin: opcoes.margin ?? MARGEM_PADRAO,
    });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${escapeHtml(filename)}"`,
      },
    });
  } finally {
    await page.close();
  }
}
