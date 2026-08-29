/** Escapa texto pra dentro de HTML — todo template usa isto pra interpolar dado real (nunca `dangerouslySetInnerHTML`-like). */
export function escapeHtml(valor: string): string {
  const mapa: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return valor.replace(/[&<>"']/g, (char) => mapa[char] ?? char);
}

/** Igual `escapeHtml`, mas trata `null`/`undefined`/`""` como um traço — padrão de "campo vazio" em todo template. */
export function valorHtml(valor: string | number | null | undefined): string {
  return escapeHtml(valor === null || valor === undefined || valor === "" ? "—" : String(valor));
}
