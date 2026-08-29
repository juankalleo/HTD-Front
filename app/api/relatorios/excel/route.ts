// Segunda exceção ao "sem app/api/*" deste projeto (ver ROADMAP.md,
// "Decisão revista: sem Route Handler / proxy Next.js") — a primeira é
// `relatorios/pdf`. ExcelJS roda em Node puro (sem Chromium), mas o
// motivo de existir como Route Handler é o mesmo: montar o arquivo no
// servidor, nunca no Client Component. Mesma guarda de sessão do PDF
// (`exigirSessaoValida`) e mesma disciplina de validação (Zod antes de
// qualquer template rodar) — ver `docs/SEGURANCA-EXPORTACAO.md` e
// `docs/ESTILOS-DE-EXCEL.md`.
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { gerarRelatorioExcelResponse } from "@/lib/server/relatorio-excel";
import { relatorioExcelRequestSchema } from "@/lib/server/relatorio-excel/request-schema";
import { exigirSessaoValida } from "@/lib/server/auth-guard";

export async function POST(request: Request) {
  const naoAutorizado = await exigirSessaoValida(request);
  if (naoAutorizado) return naoAutorizado;

  const corpoBruto = await request.json().catch(() => null);
  const resultado = relatorioExcelRequestSchema.safeParse(corpoBruto);
  if (!resultado.success) {
    return NextResponse.json(
      { status: "error", message: "Payload inválido pra gerar a planilha.", errors: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const { template, ...dados } = resultado.data;
  return gerarRelatorioExcelResponse(template, dados);
}
