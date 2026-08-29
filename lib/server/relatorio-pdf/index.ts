import { renderizarPdf } from "./core";
import { template as simples } from "./templates/simples";
import { template as institucional } from "./templates/institucional";
import type { RelatorioPdfDados, RelatorioPdfTemplateNome } from "./types";

export type { RelatorioPdfDados, RelatorioPdfTemplateNome } from "./types";

/**
 * Ponto único de entrada — recebe o NOME do estilo (`template`) e os DADOS
 * (`dados`, iguais pra qualquer estilo), escolhe o template certo em
 * `templates/`, monta o HTML e devolve o PDF. Relatório novo = escolher um
 * template já pronto aqui; template novo = adicionar um arquivo em
 * `templates/` e uma linha no mapa abaixo. Ver `docs/ESTILOS-DE-PDF.md`.
 */
const TEMPLATES: Record<RelatorioPdfTemplateNome, typeof simples> = {
  simples,
  institucional,
};

export async function gerarRelatorioPdfResponse(templateNome: RelatorioPdfTemplateNome, dados: RelatorioPdfDados) {
  const { montarHtml, opcoesPdf } = TEMPLATES[templateNome];
  const html = montarHtml(dados);
  return renderizarPdf(html, dados.filename, opcoesPdf);
}
