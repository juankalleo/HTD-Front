import type { ReferencialFormValues, ReferencialKey, ReferencialRecord } from "./types";

type FieldKind = "text" | "number" | "select";

export type ReferencialField = {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  source?: ReferencialKey;
  defaultValue?: (record: ReferencialRecord) => string;
};

type ReferencialColumn = {
  id: string;
  header: string;
  value: (record: ReferencialRecord) => string;
  sortField?: string;
  muted?: boolean;
};

export type ReferencialFilter = {
  name: string;
  label: string;
  source: ReferencialKey;
  queryParam: string;
};

export type ReferencialConfig = {
  key: ReferencialKey;
  group: "Geografia" | "Organização";
  title: string;
  singular: string;
  gender?: "masculine" | "feminine";
  description: string;
  resource: string;
  bodyKey: string;
  searchParam: string;
  searchPlaceholder: string;
  optionSort: string;
  fields: ReferencialField[];
  columns: ReferencialColumn[];
  filters?: ReferencialFilter[];
  optionLabel: (record: ReferencialRecord) => string;
};

function text(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return typeof value === "string" && value.trim() ? value.trim() : "—";
}

function relationLabel(record: ReferencialRecord | null | undefined, fallback = "—") {
  if (!record) return fallback;
  return text(record.nome ?? record.descricao);
}

function paisLabel(record: ReferencialRecord | null | undefined) {
  if (!record) return "—";
  const descricao = text(record.descricao);
  return record.sigla ? `${descricao} (${record.sigla})` : descricao;
}

function estadoLabel(record: ReferencialRecord | null | undefined) {
  if (!record) return "—";
  const descricao = text(record.descricao);
  return record.uf ? `${record.uf} - ${descricao}` : descricao;
}

function municipioLabel(record: ReferencialRecord | null | undefined) {
  if (!record) return "—";
  const descricao = text(record.descricao);
  const uf = record.g_estado?.uf;
  return uf ? `${descricao}/${uf}` : descricao;
}

const paisesFields: ReferencialField[] = [
  { name: "descricao", label: "Descrição", kind: "text", maxLength: 255, placeholder: "Brasil" },
  { name: "sigla", label: "Sigla", kind: "text", maxLength: 12, placeholder: "BR" },
];

export const REFERENCIAIS: Record<ReferencialKey, ReferencialConfig> = {
  paises: {
    key: "paises",
    group: "Geografia",
    title: "Países",
    singular: "País",
    description: "Cadastro base usado por estados.",
    resource: "g_pais",
    bodyKey: "g_pais",
    searchParam: "q[descricao_or_sigla_cont]",
    searchPlaceholder: "Buscar por descrição ou sigla...",
    optionSort: "descricao asc",
    fields: paisesFields,
    columns: [
      { id: "descricao", header: "Descrição", value: (record) => text(record.descricao), sortField: "descricao" },
      { id: "sigla", header: "Sigla", value: (record) => text(record.sigla), sortField: "sigla" },
    ],
    optionLabel: paisLabel,
  },
  estados: {
    key: "estados",
    group: "Geografia",
    title: "Estados",
    singular: "Estado",
    description: "Cadastro de estados/UF vinculado ao país.",
    resource: "g_estados",
    bodyKey: "g_estado",
    searchParam: "q[descricao_or_uf_cont]",
    searchPlaceholder: "Buscar por descrição ou UF...",
    optionSort: "descricao asc",
    fields: [
      { name: "descricao", label: "Descrição", kind: "text", maxLength: 255, placeholder: "Rondônia" },
      { name: "uf", label: "UF", kind: "text", maxLength: 2, placeholder: "RO" },
      { name: "g_pais_id", label: "País", kind: "select", source: "paises", defaultValue: (record) => String(record.g_pais?.id ?? "") },
    ],
    columns: [
      { id: "descricao", header: "Descrição", value: (record) => text(record.descricao), sortField: "descricao" },
      { id: "uf", header: "UF", value: (record) => text(record.uf), sortField: "uf" },
      { id: "pais", header: "País", value: (record) => paisLabel(record.g_pais), muted: true },
    ],
    filters: [{ name: "g_pais_id", label: "País", source: "paises", queryParam: "q[g_pais_id_eq]" }],
    optionLabel: estadoLabel,
  },
  municipios: {
    key: "municipios",
    group: "Geografia",
    title: "Municípios",
    singular: "Município",
    description: "Cadastro de cidades/municípios com código IBGE e vínculo ao estado.",
    resource: "g_municipios",
    bodyKey: "g_municipio",
    searchParam: "q[descricao_cont]",
    searchPlaceholder: "Buscar por município...",
    optionSort: "descricao asc",
    fields: [
      { name: "descricao", label: "Descrição", kind: "text", maxLength: 255, placeholder: "Porto Velho" },
      { name: "codigo_ibge", label: "Código IBGE", kind: "number", placeholder: "1100205" },
      { name: "g_estado_id", label: "Estado", kind: "select", source: "estados", defaultValue: (record) => String(record.g_estado?.id ?? "") },
    ],
    columns: [
      { id: "descricao", header: "Município", value: (record) => text(record.descricao), sortField: "descricao" },
      { id: "codigo_ibge", header: "Código IBGE", value: (record) => text(record.codigo_ibge), sortField: "codigo_ibge" },
      { id: "estado", header: "Estado", value: (record) => estadoLabel(record.g_estado), muted: true },
    ],
    filters: [{ name: "g_estado_id", label: "Estado", source: "estados", queryParam: "q[g_estado_id_eq]" }],
    optionLabel: municipioLabel,
  },
  tenants: {
    key: "tenants",
    group: "Organização",
    title: "Tenants",
    singular: "Tenant",
    description: "Cliente raiz do SaaS; órgãos e configurações institucionais ficam abaixo dele.",
    resource: "a_tenants",
    bodyKey: "a_tenant",
    searchParam: "q[nome_cont]",
    searchPlaceholder: "Buscar por nome...",
    optionSort: "nome asc",
    fields: [{ name: "nome", label: "Nome", kind: "text", maxLength: 255, placeholder: "Prefeitura Municipal" }],
    columns: [{ id: "nome", header: "Nome", value: (record) => text(record.nome), sortField: "nome" }],
    optionLabel: (record) => text(record.nome),
  },
  orgaos: {
    key: "orgaos",
    group: "Organização",
    title: "Órgãos",
    singular: "Órgão",
    description: "Secretaria, autarquia ou órgão-mãe vinculado a um tenant.",
    resource: "a_orgaos",
    bodyKey: "a_orgao",
    searchParam: "q[nome_cont]",
    searchPlaceholder: "Buscar por nome...",
    optionSort: "nome asc",
    fields: [
      { name: "nome", label: "Nome", kind: "text", maxLength: 255, placeholder: "Secretaria de Administração" },
      { name: "a_tenant_id", label: "Tenant", kind: "select", source: "tenants", defaultValue: (record) => String(record.a_tenant?.id ?? "") },
    ],
    columns: [
      { id: "nome", header: "Nome", value: (record) => text(record.nome), sortField: "nome" },
      { id: "tenant", header: "Tenant", value: (record) => relationLabel(record.a_tenant), muted: true },
    ],
    filters: [{ name: "a_tenant_id", label: "Tenant", source: "tenants", queryParam: "q[a_tenant_id_eq]" }],
    optionLabel: (record) => {
      const nome = text(record.nome);
      return record.a_tenant ? `${nome} (${relationLabel(record.a_tenant)})` : nome;
    },
  },
  "tipos-unidade": {
    key: "tipos-unidade",
    group: "Organização",
    title: "Tipos de unidade",
    singular: "Tipo de unidade",
    description: "Classificação de unidade administrativa.",
    resource: "a_tipos_unidade",
    bodyKey: "a_tipo_unidade",
    searchParam: "q[descricao_cont]",
    searchPlaceholder: "Buscar por descrição...",
    optionSort: "descricao asc",
    fields: [{ name: "descricao", label: "Descrição", kind: "text", maxLength: 255, placeholder: "Escola" }],
    columns: [{ id: "descricao", header: "Descrição", value: (record) => text(record.descricao), sortField: "descricao" }],
    optionLabel: (record) => text(record.descricao),
  },
  unidades: {
    key: "unidades",
    group: "Organização",
    title: "Unidades",
    singular: "Unidade",
    gender: "feminine",
    description: "Unidade operacional vinculada a órgão, tipo de unidade e município.",
    resource: "a_unidades",
    bodyKey: "a_unidade",
    searchParam: "q[nome_cont]",
    searchPlaceholder: "Buscar por nome...",
    optionSort: "nome asc",
    fields: [
      { name: "nome", label: "Nome", kind: "text", maxLength: 255, placeholder: "Unidade Central" },
      { name: "a_orgao_id", label: "Órgão", kind: "select", source: "orgaos", defaultValue: (record) => String(record.a_orgao?.id ?? "") },
      {
        name: "a_tipo_unidade_id",
        label: "Tipo de unidade",
        kind: "select",
        source: "tipos-unidade",
        defaultValue: (record) => String(record.a_tipo_unidade?.id ?? ""),
      },
      {
        name: "g_municipio_id",
        label: "Município",
        kind: "select",
        source: "municipios",
        required: false,
        defaultValue: (record) => String(record.g_municipio?.id ?? ""),
      },
    ],
    columns: [
      { id: "nome", header: "Nome", value: (record) => text(record.nome), sortField: "nome" },
      { id: "orgao", header: "Órgão", value: (record) => relationLabel(record.a_orgao), muted: true },
      { id: "tipo", header: "Tipo", value: (record) => relationLabel(record.a_tipo_unidade), muted: true },
      { id: "municipio", header: "Município", value: (record) => municipioLabel(record.g_municipio), muted: true },
    ],
    filters: [
      { name: "a_orgao_id", label: "Órgão", source: "orgaos", queryParam: "q[a_orgao_id_eq]" },
      { name: "a_tipo_unidade_id", label: "Tipo", source: "tipos-unidade", queryParam: "q[a_tipo_unidade_id_eq]" },
      { name: "g_municipio_id", label: "Município", source: "municipios", queryParam: "q[g_municipio_id_eq]" },
    ],
    optionLabel: (record) => text(record.nome),
  },
};

export const REFERENCIAL_KEYS = Object.keys(REFERENCIAIS) as ReferencialKey[];

export function isReferencialKey(value: string): value is ReferencialKey {
  return value in REFERENCIAIS;
}

export function getReferencialConfig(value: string) {
  return isReferencialKey(value) ? REFERENCIAIS[value] : null;
}

export function getReferencialDefaultValues(config: ReferencialConfig, record?: ReferencialRecord): ReferencialFormValues {
  return Object.fromEntries(
    config.fields.map((field) => {
      if (!record) return [field.name, ""];
      const value = field.defaultValue ? field.defaultValue(record) : record[field.name as keyof ReferencialRecord];
      return [field.name, value == null ? "" : String(value)];
    }),
  );
}

export function buildReferencialBody(config: ReferencialConfig, values: ReferencialFormValues) {
  const body: Record<string, unknown> = {};

  for (const field of config.fields) {
    const rawValue = values[field.name]?.trim() ?? "";

    if (field.required === false && rawValue === "") {
      body[field.name] = null;
      continue;
    }

    body[field.name] = field.kind === "number" ? Number(rawValue) : rawValue;
  }

  return { [config.bodyKey]: body };
}

export function getReferencialTitle(config: ReferencialConfig, record: ReferencialRecord) {
  return text(record.nome ?? record.descricao);
}

export function getReferencialNewLabel(config: ReferencialConfig) {
  return `${config.gender === "feminine" ? "Nova" : "Novo"} ${config.singular.toLowerCase()}`;
}

export function getReferencialEmptyMessage(config: ReferencialConfig) {
  const artigo = config.gender === "feminine" ? "Nenhuma" : "Nenhum";
  const sufixo = config.gender === "feminine" ? "encontrada" : "encontrado";
  return `${artigo} ${config.singular.toLowerCase()} ${sufixo}.`;
}

export function getReferencialOptionLabel(recurso: ReferencialKey, record: ReferencialRecord) {
  return REFERENCIAIS[recurso].optionLabel(record);
}

export function getReferencialOptionSources(config: ReferencialConfig) {
  const sources = new Set<ReferencialKey>();
  config.fields.forEach((field) => {
    if (field.source) sources.add(field.source);
  });
  config.filters?.forEach((filter) => sources.add(filter.source));
  return [...sources];
}
