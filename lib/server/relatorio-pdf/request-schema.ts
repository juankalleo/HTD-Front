import { z } from "zod";

/**
 * Validação em runtime do corpo de `POST /api/relatorios/pdf` — a única
 * fronteira de rede não confiável deste motor (o payload vem do browser de
 * quem chamou, nunca confiar só no `as RelatorioPdfDados` de tipo
 * estático). Espelha `RelatorioPdfDados`/`RelatorioPdfTemplateNome`
 * (`types.ts`) — mesma forma, mas validada de verdade em vez de só
 * type-cast. Ver `docs/SEGURANCA-EXPORTACAO.md`.
 *
 * `filename` restrito a um formato seguro de propósito: vira o valor de um
 * header HTTP (`Content-Disposition`), então precisa **rejeitar**
 * `\r`/`\n`/etc. na validação (não só escapar depois) — é a defesa real
 * contra header injection, escapar HTML não protege header.
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

export const relatorioPdfRequestSchema = z.object({
  template: z.enum(["simples", "institucional"]),
  filename: z.string().regex(/^[\w.-]+\.pdf$/, "filename inválido"),
  geradoEm: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  marca: z.object({ nome: z.string(), iconeUrl: z.string().nullable().optional() }).optional(),
  emissor: z.object({ nome: z.string(), contexto: z.string().optional() }).optional(),
  filtros: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  kpis: z.array(kpiSchema),
  columns: z.array(columnSchema),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null(), z.undefined()]))),
});
