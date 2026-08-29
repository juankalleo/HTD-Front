import ExcelJS from "exceljs";
import { valorCelulaSegura } from "../cell-utils";
import type { RelatorioExcelDados, RelatorioExcelTemplate } from "../types";

/**
 * Estilo "institucional" — título com marca, filtros aplicados, cartões de
 * KPI, tabela com cabeçalho colorido + zebra, rodapé com emissor. Mesma
 * paleta do template PDF homônimo (`lib/server/relatorio-pdf/templates/
 * institucional.ts`) — slate escuro pro cabeçalho, cinza claro pro zebra —
 * pra quem abre os dois formatos do mesmo relatório reconhecer a mesma
 * identidade visual. Sem imagem embutida (ver `dados.marca` em `types.ts`
 * e `docs/ESTILOS-DE-EXCEL.md` pro porquê).
 */
const COR_CABECALHO = "FF1E293B";
const COR_TEXTO_CABECALHO = "FFFFFFFF";
const COR_ZEBRA = "FFF1F5F9";
const COR_MUTED = "FF64748B";

function montarWorkbook(dados: RelatorioExcelDados): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = dados.marca?.nome ?? "Sistema";
  workbook.created = new Date(dados.geradoEm);

  const planilha = workbook.addWorksheet((dados.title || "Relatório").slice(0, 31));
  const numColunas = Math.max(dados.columns.length, 1);
  let linha = 1;

  if (dados.marca?.nome) {
    planilha.mergeCells(linha, 1, linha, numColunas);
    const marcaCell = planilha.getCell(linha, 1);
    marcaCell.value = dados.marca.nome.toUpperCase();
    marcaCell.font = { bold: true, size: 10, color: { argb: COR_MUTED } };
    linha++;
  }

  planilha.mergeCells(linha, 1, linha, numColunas);
  const tituloCell = planilha.getCell(linha, 1);
  tituloCell.value = dados.title;
  tituloCell.font = { bold: true, size: 16, color: { argb: COR_CABECALHO } };
  linha++;

  if (dados.subtitle) {
    planilha.mergeCells(linha, 1, linha, numColunas);
    const subtituloCell = planilha.getCell(linha, 1);
    subtituloCell.value = dados.subtitle;
    subtituloCell.font = { size: 10, color: { argb: COR_MUTED } };
    linha++;
  }

  planilha.mergeCells(linha, 1, linha, numColunas);
  const metaCell = planilha.getCell(linha, 1);
  metaCell.value = `Gerado em ${new Date(dados.geradoEm).toLocaleString("pt-BR")}`;
  metaCell.font = { size: 9, color: { argb: "FF94A3B8" } };
  linha += 2;

  const filtrosAtivos = dados.filtros?.filter((filtro) => filtro.value);
  if (filtrosAtivos?.length) {
    planilha.mergeCells(linha, 1, linha, numColunas);
    const filtrosCell = planilha.getCell(linha, 1);
    filtrosCell.value = `Filtros ativos: ${filtrosAtivos.map((filtro) => `${filtro.label}: ${filtro.value}`).join(" · ")}`;
    filtrosCell.font = { italic: true, size: 9, color: { argb: "FF92400E" } };
    filtrosCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFBEB" } };
    linha += 2;
  }

  if (dados.kpis.length) {
    dados.kpis.forEach((kpi, index) => {
      const coluna = index + 1;
      const labelCell = planilha.getCell(linha, coluna);
      labelCell.value = kpi.label;
      labelCell.font = { bold: true, size: 8, color: { argb: COR_MUTED } };
      const valorCell = planilha.getCell(linha + 1, coluna);
      valorCell.value = kpi.value;
      valorCell.font = { bold: true, size: 14, color: { argb: COR_CABECALHO } };
    });
    linha += 3;
  }

  const linhaHeader = linha;
  dados.columns.forEach((coluna, index) => {
    const cell = planilha.getCell(linhaHeader, index + 1);
    cell.value = coluna.label;
    cell.font = { bold: true, color: { argb: COR_TEXTO_CABECALHO } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR_CABECALHO } };
    cell.alignment = { horizontal: coluna.align ?? "left" };
  });

  dados.rows.forEach((row, rowIndex) => {
    const linhaExcel = linhaHeader + 1 + rowIndex;
    dados.columns.forEach((coluna, colIndex) => {
      const cell = planilha.getCell(linhaExcel, colIndex + 1);
      cell.value = valorCelulaSegura(row[coluna.key]);
      cell.alignment = { horizontal: coluna.align ?? "left" };
      if (rowIndex % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR_ZEBRA } };
      }
    });
  });

  if (dados.emissor) {
    const linhaEmissor = linhaHeader + dados.rows.length + 2;
    planilha.mergeCells(linhaEmissor, 1, linhaEmissor, numColunas);
    const emissorCell = planilha.getCell(linhaEmissor, 1);
    emissorCell.value = `Emitido por: ${dados.emissor.nome}${dados.emissor.contexto ? ` · ${dados.emissor.contexto}` : ""}`;
    emissorCell.font = { italic: true, size: 9, color: { argb: COR_MUTED } };
  }

  planilha.columns.forEach((coluna) => {
    coluna.width = 24;
  });

  return workbook;
}

export const template: RelatorioExcelTemplate = { montarWorkbook };
