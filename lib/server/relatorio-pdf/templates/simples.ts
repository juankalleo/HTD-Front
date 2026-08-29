import { escapeHtml, valorHtml } from "../html-utils";
import type { RelatorioPdfDados, RelatorioPdfTemplate } from "../types";

/**
 * Estilo "simples" — cartões de KPI + tabela, sem marca/assinatura. Pro
 * relatório rápido/interno, onde o visual formal do "institucional" (ver
 * `institucional.ts`) é peso a mais. Ignora `dados.marca`/`dados.emissor` de
 * propósito — quem quiser isso usa o template institucional.
 */
function montarHtml(dados: RelatorioPdfDados): string {
  const geradoEm = new Date(dados.geradoEm).toLocaleString("pt-BR");
  const filtrosAtivos = dados.filtros?.filter((filtro) => filtro.value);
  const filtrosHtml = filtrosAtivos?.length ? ` · ${filtrosAtivos.map((filtro) => `${escapeHtml(filtro.label)}: ${escapeHtml(filtro.value)}`).join(" · ")}` : "";

  const kpisHtml = dados.kpis
    .slice(0, 4)
    .map((kpi) => `<div class="kpi"><span class="kpi-label">${escapeHtml(kpi.label)}</span><span class="kpi-value">${valorHtml(kpi.value)}</span></div>`)
    .join("");

  const headersHtml = dados.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("");
  const linhasHtml = dados.rows
    .map((row) => `<tr>${dados.columns.map((column) => `<td>${valorHtml(row[column.key])}</td>`).join("")}</tr>`)
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111827; margin: 0; padding: 24px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .subtitle { margin: 0 0 6px; font-size: 12px; color: #374151; }
  .meta { font-size: 11px; color: #6b7280; margin-bottom: 20px; }
  .kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
  .kpi { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; min-width: 0; }
  .kpi-label { display: block; font-size: 10px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .kpi-value { display: block; font-size: 18px; font-weight: 700; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { text-align: left; padding: 7px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  th { color: #6b7280; font-weight: 600; }
</style>
</head>
<body>
  <h1>${escapeHtml(dados.title)}</h1>
  ${dados.subtitle ? `<p class="subtitle">${escapeHtml(dados.subtitle)}</p>` : ""}
  <p class="meta">Gerado em ${geradoEm}${filtrosHtml}</p>
  <div class="kpis">${kpisHtml}</div>
  <table>
    <thead><tr>${headersHtml}</tr></thead>
    <tbody>${linhasHtml}</tbody>
  </table>
</body>
</html>`;
}

export const template: RelatorioPdfTemplate = {
  montarHtml,
  opcoesPdf: { margin: { top: "16mm", right: "12mm", bottom: "18mm", left: "12mm" } },
};
