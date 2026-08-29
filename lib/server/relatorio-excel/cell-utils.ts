/**
 * Defesa contra "injeção de fórmula" (CSV/Excel Formula Injection —
 * CWE-1236) — categoria de vulnerabilidade **específica de planilha**, não
 * coberta pelo `escapeHtml` do PDF (`lib/server/relatorio-pdf/`). Se uma
 * célula começar com `=`, `+`, `-`, `@` (ou tab/CR), o Excel pode
 * interpretar o conteúdo como fórmula ao abrir o arquivo — um `nome` de
 * usuário como `=HYPERLINK("http://evil.com","clique")` (ou, em versões
 * antigas do Excel, uma fórmula DDE) executaria ao abrir, não é só texto
 * mostrado na tela como no HTML de um PDF. Ver `docs/SEGURANCA-EXPORTACAO.md`
 * (mesma disciplina, ameaça diferente) e `docs/ESTILOS-DE-EXCEL.md`.
 *
 * Defesa: prefixa `'` (apóstrofo) em qualquer valor que comece com um
 * desses caracteres — o Excel/`ExcelJS` trata isso como "forçar texto",
 * a célula mostra o conteúdo original (sem o apóstrofo) mas nunca calcula
 * como fórmula.
 */
const PREFIXOS_DE_FORMULA = ["=", "+", "-", "@", "\t", "\r"];

export function valorCelulaSegura(valor: string | number | null | undefined): string | number {
  if (valor === null || valor === undefined) return "";
  if (typeof valor === "number") return valor;
  return PREFIXOS_DE_FORMULA.some((prefixo) => valor.startsWith(prefixo)) ? `'${valor}` : valor;
}
