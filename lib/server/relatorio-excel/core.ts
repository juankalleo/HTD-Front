import type ExcelJS from "exceljs";
import { NextResponse } from "next/server";

/**
 * Motor de Excel — só sabe transformar um `ExcelJS.Workbook` pronto em
 * bytes de `.xlsx`. Não sabe nada sobre KPI/tabela/relatório: isso é
 * responsabilidade de cada `templates/*.ts`. Mesmo papel que `core.ts` de
 * `lib/server/relatorio-pdf`, só que sem processo externo (ExcelJS gera o
 * arquivo em memória, puro Node — não precisa de Chromium).
 *
 * `filename` já chega validado pelo Zod (`request-schema.ts`, regex
 * `[\w.-]+\.xlsx`) antes daqui — esse conjunto de caracteres não permite
 * `\r`/`\n`, então não tem como injetar header no `Content-Disposition`
 * (mesma ameaça do PDF, ver `docs/SEGURANCA-EXPORTACAO.md`; a defesa aqui é a
 * validação na fronteira, não escape no meio do caminho).
 */
export async function renderizarExcel(workbook: ExcelJS.Workbook, filename: string): Promise<NextResponse> {
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
