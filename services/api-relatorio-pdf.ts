import { getAccessToken } from "@/lib/auth";
import type { RelatorioPdfDados, RelatorioPdfTemplateNome } from "@/lib/server/relatorio-pdf";

export type { RelatorioPdfDados, RelatorioPdfTemplateNome } from "@/lib/server/relatorio-pdf";

/**
 * Serviço do PDF de relatório — POST pro Route Handler local
 * (`app/api/relatorios/pdf/route.ts`), não pro Rails `api/`. É a exceção ao
 * "sem app/api/*": geração de PDF via Puppeteer precisa de runtime Node.
 * `RelatorioPdfDados`/`RelatorioPdfTemplateNome` vêm de `lib/server/
 * relatorio-pdf` só como TIPO (`import type` — apagado em build, o código
 * de servidor/Puppeteer nunca entra no bundle do client). Estilo/motor de
 * verdade documentados em `docs/ESTILOS-DE-PDF.md`; segurança (por que o
 * token vai junto) em `docs/SEGURANCA-EXPORTACAO.md`.
 */
export async function gerarRelatorioPdf(template: RelatorioPdfTemplateNome, dados: RelatorioPdfDados): Promise<Blob> {
  const token = getAccessToken();
  const response = await fetch("/api/relatorios/pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ template, ...dados }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível gerar o PDF do relatório.");
  }

  return response.blob();
}

export type RelatorioUsuariosPdfPayload = {
  geradoEm: string;
  marca: { nome: string; iconeUrl?: string | null };
  emissor: { nome: string; contexto?: string };
  filtro: { busca: string; tipoLabel: string };
  kpis: { total: number; porTipo: { descricao: string; total: number }[] };
  linhas: { nome: string; tipo: string }[];
};

/** Relatório de usuários usa o template "institucional" — é o que tem marca/emissor no cabeçalho/rodapé. */
export function gerarRelatorioUsuariosPdf(payload: RelatorioUsuariosPdfPayload): Promise<Blob> {
  const principaisTipos = [...payload.kpis.porTipo].sort((left, right) => right.total - left.total).slice(0, 3);

  const dados: RelatorioPdfDados = {
    title: "Relatório de usuários",
    subtitle: "Nome e tipo de cada usuário",
    filename: "relatorio-usuarios.pdf",
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

  return gerarRelatorioPdf("institucional", dados);
}
