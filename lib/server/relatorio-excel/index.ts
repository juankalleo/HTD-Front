import { renderizarExcel } from "./core";
import { template as simples } from "./templates/simples";
import { template as institucional } from "./templates/institucional";
import type { RelatorioExcelDados, RelatorioExcelTemplateNome } from "./types";

export type { RelatorioExcelDados, RelatorioExcelTemplateNome } from "./types";

/**
 * Ponto único de entrada — mesmo papel do `index.ts` de
 * `lib/server/relatorio-pdf`: recebe o nome do estilo + os dados, escolhe
 * o template certo em `templates/`, monta o `Workbook` e devolve o
 * `.xlsx`. Relatório novo = escolher um template já pronto; template novo
 * = arquivo novo em `templates/` + uma linha no mapa abaixo. Ver
 * `docs/ESTILOS-DE-EXCEL.md`.
 */
const TEMPLATES: Record<RelatorioExcelTemplateNome, typeof simples> = {
  simples,
  institucional,
};

export async function gerarRelatorioExcelResponse(templateNome: RelatorioExcelTemplateNome, dados: RelatorioExcelDados) {
  const { montarWorkbook } = TEMPLATES[templateNome];
  const workbook = montarWorkbook(dados);
  return renderizarExcel(workbook, dados.filename);
}
