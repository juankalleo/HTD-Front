import type ExcelJS from "exceljs";

/**
 * Contrato de DADOS de um relatório em Excel — mesma forma pra qualquer
 * template em `templates/*` (o campo `template` escolhe a apresentação,
 * ver `index.ts`), igual `RelatorioPdfDados` em `lib/server/relatorio-pdf`.
 * É um tipo **separado** (não o mesmo `RelatorioPdfDados`) de propósito:
 * cada formato de export tem seu próprio módulo completo — motor, tipos,
 * templates — pra achar "onde é Excel" e "onde é PDF" nunca depender de
 * saber que um reusa o tipo do outro por baixo dos panos. Ver
 * `docs/ESTILOS-DE-EXCEL.md`.
 */
export type RelatorioExcelDados = {
  filename: string;
  geradoEm: string; // ISO 8601
  title: string;
  subtitle?: string;
  /** Marca do sistema (Identidade institucional). Só o nome — sem imagem embutida na planilha, ver docs/ESTILOS-DE-EXCEL.md. */
  marca?: { nome: string };
  /** Quem emitiu (usuário logado). Opcional: nem todo template usa. */
  emissor?: { nome: string; contexto?: string };
  filtros?: { label: string; value: string }[];
  kpis: { label: string; value: number | string }[];
  columns: { key: string; label: string; align?: "left" | "right" | "center" }[];
  rows: Record<string, string | number | null | undefined>[];
};

export type RelatorioExcelTemplateNome = "simples" | "institucional";

export type RelatorioExcelTemplate = {
  montarWorkbook: (dados: RelatorioExcelDados) => ExcelJS.Workbook;
};
