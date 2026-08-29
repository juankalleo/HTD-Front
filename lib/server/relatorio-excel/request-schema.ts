import { z } from "zod";

/**
 * Validação em runtime do corpo de `POST /api/relatorios/excel` — mesma
 * disciplina do PDF (`lib/server/relatorio-pdf/request-schema.ts`, ver
 * `docs/SEGURANCA-EXPORTACAO.md`): nunca confiar só no `as RelatorioExcelDados`
 * de tipo estático. `filename` restrito a formato seguro (termina em
 * `.xlsx`, sem `\r`/`\n`/etc.) pelo mesmo motivo do PDF — vira valor de
 * um header HTTP.
 */
const kpiSchema = z.object({
  label: z.string(),
  value: z.union([z.number(), z.string()]),
});

const columnSchema = z.object({
  key: z.string(),
  label: z.string(),
  align: z.enum(["left", "right", "center"]).optional(),
});

export const relatorioExcelRequestSchema = z.object({
  template: z.enum(["simples", "institucional"]),
  filename: z.string().regex(/^[\w.-]+\.xlsx$/, "filename inválido"),
  geradoEm: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  marca: z.object({ nome: z.string() }).optional(),
  emissor: z.object({ nome: z.string(), contexto: z.string().optional() }).optional(),
  filtros: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  kpis: z.array(kpiSchema),
  columns: z.array(columnSchema),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null(), z.undefined()]))),
});
