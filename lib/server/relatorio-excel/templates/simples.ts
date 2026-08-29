import ExcelJS from "exceljs";
import { valorCelulaSegura } from "../cell-utils";
import type { RelatorioExcelDados, RelatorioExcelTemplate } from "../types";

/**
 * Estilo "simples" — título + tabela, sem marca/KPI/rodapé de emissor.
 * Mesmo par conceitual do `templates/simples.ts` de
 * `lib/server/relatorio-pdf` — pro relatório rápido/interno. Ignora
 * `dados.marca`/`dados.emissor`/`dados.kpis` de propósito.
 */
function montarWorkbook(dados: RelatorioExcelDados): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.created = new Date(dados.geradoEm);

  const planilha = workbook.addWorksheet((dados.title || "Relatório").slice(0, 31));
  const numColunas = Math.max(dados.columns.length, 1);

  planilha.mergeCells(1, 1, 1, numColunas);
  const tituloCell = planilha.getCell(1, 1);
  tituloCell.value = dados.title;
  tituloCell.font = { bold: true, size: 14 };

  planilha.mergeCells(2, 1, 2, numColunas);
  const metaCell = planilha.getCell(2, 1);
  metaCell.value = `Gerado em ${new Date(dados.geradoEm).toLocaleString("pt-BR")}`;
  metaCell.font = { size: 9, color: { argb: "FF6B7280" } };

  const linhaHeader = 4;
  dados.columns.forEach((coluna, index) => {
    const cell = planilha.getCell(linhaHeader, index + 1);
    cell.value = coluna.label;
    cell.font = { bold: true, color: { argb: "FF374151" } };
    cell.alignment = { horizontal: coluna.align ?? "left" };
  });

  dados.rows.forEach((row, rowIndex) => {
    dados.columns.forEach((coluna, colIndex) => {
      const cell = planilha.getCell(linhaHeader + 1 + rowIndex, colIndex + 1);
      cell.value = valorCelulaSegura(row[coluna.key]);
      cell.alignment = { horizontal: coluna.align ?? "left" };
    });
  });

  planilha.columns.forEach((coluna) => {
    coluna.width = 22;
  });

  return workbook;
}

export const template: RelatorioExcelTemplate = { montarWorkbook };
