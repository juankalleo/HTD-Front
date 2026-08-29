/**
 * Baixa um `Blob` já pronto como arquivo — não sabe nada de PDF/Excel/
 * relatório, é só o mecanismo genérico (`URL.createObjectURL` + `<a
 * download>`). Usado pelos dois formatos de export (`services/
 * api-relatorio-pdf.ts`, `services/api-relatorio-excel.ts`) e pelos
 * modais de preview correspondentes — um lugar só pra essa mecânica,
 * nunca duplicada por formato.
 */
export function baixarArquivo(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
