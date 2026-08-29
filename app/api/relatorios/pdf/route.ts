// Única exceção ao "sem app/api/*" deste projeto (ver ROADMAP.md, "Decisão
// revista: sem Route Handler / proxy Next.js") — geração de PDF via
// Puppeteer precisa de runtime Node com Chromium, que só o próprio Next.js
// oferece aqui. O Rails `api/` não fornece dado de relatório nenhum pra
// essa rota (a tela já manda tudo pronto) — a ÚNICA vez que esta rota fala
// com o Rails é pra confirmar sessão válida antes de gastar Puppeteer com
// quem não está logado (`exigirSessaoValida`, ver `docs/SEGURANCA-EXPORTACAO.md`).
// Estilo/motor de verdade em `lib/server/relatorio-pdf/` (ver
// `docs/ESTILOS-DE-PDF.md`).
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { gerarRelatorioPdfResponse } from "@/lib/server/relatorio-pdf";
import { relatorioPdfRequestSchema } from "@/lib/server/relatorio-pdf/request-schema";
import { exigirSessaoValida } from "@/lib/server/auth-guard";

export async function POST(request: Request) {
  const naoAutorizado = await exigirSessaoValida(request);
  if (naoAutorizado) return naoAutorizado;

  const corpoBruto = await request.json().catch(() => null);
  const resultado = relatorioPdfRequestSchema.safeParse(corpoBruto);
  if (!resultado.success) {
    return NextResponse.json(
      { status: "error", message: "Payload inválido pra gerar o PDF.", errors: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const { template, ...dados } = resultado.data;
  return gerarRelatorioPdfResponse(template, dados);
}
