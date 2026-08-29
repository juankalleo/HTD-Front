import { escapeHtml, valorHtml } from "../html-utils";
import type { RelatorioPdfDados, RelatorioPdfTemplate } from "../types";

/**
 * Estilo "institucional" — cabeçalho com marca do sistema, cartões de
 * resumo, filtros aplicados, tabela principal e rodapé com emissor.
 * Inspirado no padrão de PDF do brasilconstroi (`relatorio_print.html.erb`
 * / `pdf_detalhe.html.erb`, ~/Documents/projetos/brasilconstroi) — mesma
 * paleta e blocos (cartão de resumo, seção, tabela com zebra, rodapé de
 * emissão), só que renderizado aqui via Puppeteer (`../core.ts`), não
 * wkhtmltopdf. Duas diferenças deliberadas em relação à fonte:
 *
 * 1. Sem "Assinado eletronicamente" — este relatório não passa por
 *    assinatura digital nenhuma, só rastreia quem clicou exportar
 *    (`dados.emissor`). Dizer "assinado" seria inventar uma garantia que
 *    não existe.
 * 2. Sem o texto de validade jurídica do documento — é um relatório
 *    administrativo interno, não um documento oficial/contrato. Só um
 *    aviso neutro de quando/como foi gerado.
 *
 * Pro relatório que precisa desse peso visual (marca, contexto de quem
 * emitiu, aparência "documento oficial"). Pro relatório rápido/interno, ver
 * `simples.ts`.
 */
function montarHtml(dados: RelatorioPdfDados): string {
  const geradoEm = new Date(dados.geradoEm).toLocaleString("pt-BR");
  const nomeMarca = dados.marca?.nome?.trim() || "Sistema";
  const filtrosAtivos = dados.filtros?.filter((filtro) => filtro.value);

  const logoHtml = dados.marca?.iconeUrl
    ? `<img class="document-logo" src="${escapeHtml(dados.marca.iconeUrl)}" alt="${escapeHtml(nomeMarca)}" />`
    : "";

  const kpisHtml = dados.kpis
    .map(
      (kpi) =>
        `<div class="resumo-card"><div class="label">${escapeHtml(kpi.label)}</div><div class="valor">${valorHtml(kpi.value)}</div></div>`,
    )
    .join("");

  const filtrosHtml = filtrosAtivos?.length
    ? `<div class="filtros-bar"><strong>Filtros ativos:</strong> ${filtrosAtivos.map((filtro) => `${escapeHtml(filtro.label)}: ${escapeHtml(filtro.value)}`).join(" &nbsp;·&nbsp; ")}</div>`
    : "";

  const headersHtml = dados.columns
    .map((column) => `<th class="${column.align === "right" ? "r" : column.align === "center" ? "c" : ""}">${escapeHtml(column.label)}</th>`)
    .join("");
  const linhasHtml = dados.rows
    .map(
      (row) =>
        `<tr>${dados.columns.map((column) => `<td class="${column.align === "right" ? "r" : column.align === "center" ? "c" : ""}">${valorHtml(row[column.key])}</td>`).join("")}</tr>`,
    )
    .join("");

  const emissorHtml = dados.emissor
    ? `<div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-title">Emitido por</div>
        <div class="signature-name">${escapeHtml(dados.emissor.nome)}</div>
        ${dados.emissor.contexto ? `<div class="signature-context">${escapeHtml(dados.emissor.contexto)}</div>` : ""}
      </div>`
    : "";

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(dados.title)}</title>
<style>
  :root {
    --ink: #1e293b;
    --muted: #64748b;
    --line: #cbd5e1;
    --soft: #f4fbf7;
    --band: #e6f9f0;
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; color: var(--ink); font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.4; }
  .document-page { padding: 10mm; }

  .document-header { text-align: center; margin-bottom: 16px; }
  .document-logo { display: block; width: 64px; height: 64px; object-fit: contain; margin: 0 auto 8px; }
  .document-kicker { margin: 0; color: var(--muted); font-size: 10px; font-weight: 800; text-transform: uppercase; }
  .document-rule { height: 1px; margin: 10px 0 14px; background: var(--line); }
  .document-header h1 { margin: 0; color: var(--ink); font-size: 19px; font-weight: 900; line-height: 1.2; text-transform: uppercase; }
  .document-subtitle { margin: 6px auto 0; color: var(--muted); font-size: 11px; font-weight: 600; }

  .filtros-bar { margin: 0 0 14px; padding: 9px 12px; border: 1px solid #fde68a; background: #fffbeb; color: #78350f; font-size: 10.5px; line-height: 1.45; }
  .filtros-bar strong { color: #92400e; }

  .resumo-cards { display: table; width: 100%; table-layout: fixed; margin: 0 0 18px; border-top: 1px solid var(--line); border-left: 1px solid var(--line); text-align: center; }
  .resumo-card { display: table-cell; vertical-align: middle; min-width: 0; padding: 11px 10px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); background: var(--soft); }
  .resumo-card:nth-child(2) { background: #ecfdf5; }
  .resumo-card .label { margin: 0 0 4px; color: var(--muted); font-size: 9px; font-weight: 900; text-transform: uppercase; }
  .resumo-card .valor { color: var(--ink); font-size: 19px; font-weight: 900; line-height: 1.15; overflow-wrap: anywhere; }

  .section-title { margin: 18px 0 8px; padding: 9px 12px; border: 1px solid var(--line); background: var(--band); color: var(--ink); text-align: center; font-size: 12px; font-weight: 900; text-transform: uppercase; }

  table.main-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 14px; border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
  table.main-table th { padding: 7px 8px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); background: var(--soft); color: #334155; font-size: 9px; font-weight: 900; text-align: left; text-transform: uppercase; }
  table.main-table td { padding: 7px 8px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); color: var(--ink); font-size: 10.5px; vertical-align: top; overflow-wrap: anywhere; }
  table.main-table tbody tr:nth-child(even) td { background: #f8fafc; }
  table.main-table .r { text-align: right !important; }
  table.main-table .c { text-align: center !important; }

  .document-closing { margin-top: 24px; page-break-inside: avoid; }
  .document-note { margin: 0 0 18px; color: var(--muted); font-size: 9.5px; line-height: 1.5; text-align: center; }
  .signature-block { width: 100%; margin: 0 0 14px; text-align: center; }
  .signature-line { width: 62mm; max-width: 60%; height: 1px; margin: 0 auto 8px; background: var(--line); }
  .signature-title { color: var(--ink); font-size: 10px; font-weight: 900; text-transform: uppercase; }
  .signature-name { margin-top: 3px; color: var(--ink); font-size: 12px; font-weight: 800; }
  .signature-context { margin-top: 2px; color: var(--muted); font-size: 9px; font-weight: 700; }

  .document-footer { margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--line); color: var(--muted); display: table; width: 100%; font-size: 9.5px; }
  .document-footer span { display: table-cell; vertical-align: top; }
  .document-footer span:last-child { text-align: right; white-space: nowrap; }
  .document-footer strong { color: var(--ink); }

  @media print {
    @page { size: A4 portrait; margin: 10mm; }
    body { background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    .section-title { page-break-after: avoid; }
  }
</style>
</head>
<body>
  <div class="document-page">
    <header class="document-header">
      ${logoHtml}
      <p class="document-kicker">${escapeHtml(nomeMarca)}</p>
      <div class="document-rule"></div>
      <h1>${escapeHtml(dados.title)}</h1>
      ${dados.subtitle ? `<p class="document-subtitle">${escapeHtml(dados.subtitle)} <span style="color:#94a3b8;font-weight:500;">· Emitido em ${geradoEm}</span></p>` : `<p class="document-subtitle">Emitido em ${geradoEm}</p>`}
    </header>

    ${filtrosHtml}

    <div class="resumo-cards">${kpisHtml}</div>

    <div class="section-title">Detalhamento</div>
    <table class="main-table">
      <thead><tr>${headersHtml}</tr></thead>
      <tbody>${linhasHtml}</tbody>
    </table>

    <div class="document-closing">
      <p class="document-note">Documento gerado automaticamente pelo sistema, com os dados disponíveis no momento da emissão.</p>
      ${emissorHtml}
      <footer class="document-footer">
        <span><strong>${escapeHtml(nomeMarca)}</strong></span>
        <span>Gerado em ${geradoEm}</span>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

export const template: RelatorioPdfTemplate = {
  montarHtml,
  opcoesPdf: { landscape: false, margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" } },
};
