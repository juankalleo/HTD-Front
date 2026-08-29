import { getAccessToken } from "@/lib/auth";
import type { RelatorioExcelDados, RelatorioExcelTemplateNome } from "@/lib/server/relatorio-excel";

export type { RelatorioExcelDados, RelatorioExcelTemplateNome } from "@/lib/server/relatorio-excel";

/**
 * Serviço do Excel de relatório — mesmo papel de `services/
 * api-relatorio-pdf.ts`, POST pro Route Handler local
 * (`app/api/relatorios/excel/route.ts`). `RelatorioExcelDados`/
 * `RelatorioExcelTemplateNome` vêm de `lib/server/relatorio-excel` só
 * como TIPO — o motor (ExcelJS) nunca entra no bundle do client. Estilo
 * documentado em `docs/ESTILOS-DE-EXCEL.md`; segurança em
 * `docs/SEGURANCA-EXPORTACAO.md` (mesma disciplina de auth/validação nos dois
 * formatos de export).
 */
export async function gerarRelatorioExcel(template: RelatorioExcelTemplateNome, dados: RelatorioExcelDados): Promise<Blob> {
  const token = getAccessToken();
  const response = await fetch("/api/relatorios/excel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ template, ...dados }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível gerar a planilha do relatório.");
  }

  return response.blob();
}

export type RelatorioUsuariosExcelPayload = {
  geradoEm: string;
  marca: { nome: string };
  emissor: { nome: string; contexto?: string };
  filtro: { busca: string; tipoLabel: string };
  kpis: { total: number; porTipo: { descricao: string; total: number }[] };
  linhas: { nome: string; tipo: string }[];
};

/** Monta o mesmo `RelatorioExcelDados` que o PDF de usuários monta (ver `gerarRelatorioUsuariosPdf`) — dado idêntico, só o formato de saída muda. */
export function montarDadosExcelUsuarios(payload: RelatorioUsuariosExcelPayload): RelatorioExcelDados {
  const principaisTipos = [...payload.kpis.porTipo].sort((left, right) => right.total - left.total).slice(0, 3);

  return {
    title: "Relatório de usuários",
    subtitle: "Nome e tipo de cada usuário",
    filename: "relatorio-usuarios.xlsx",
    geradoEm: payload.geradoEm,
    marca: payload.marca,
    emissor: payload.emissor,
    filtros: [
      { label: "Busca", value: payload.filtro.busca || "Todos" },
      { label: "Tipo de usuário", value: payload.filtro.tipoLabel || "Todos" },
    ],
    kpis: [
      { label: "Total de usuários", value: payload.kpis.total },
      ...principaisTipos.map((item) => ({ label: item.descricao, value: item.total })),
    ],
    columns: [
      { key: "nome", label: "Nome" },
      { key: "tipo", label: "Tipo" },
    ],
    rows: payload.linhas,
  };
}

/** Relatório de usuários usa o template "institucional" — mesma identidade visual do PDF equivalente. */
export function gerarRelatorioUsuariosExcel(payload: RelatorioUsuariosExcelPayload): Promise<Blob> {
  return gerarRelatorioExcel("institucional", montarDadosExcelUsuarios(payload));
}
