export type ReferencialKey = "paises" | "estados" | "municipios" | "tenants" | "orgaos" | "tipos-unidade" | "unidades";

export type ReferencialOption = {
  valor: string;
  label: string;
};

export type ReferencialFormValues = Record<string, string>;

export type ReferencialRecord = {
  id: number;
  descricao?: string | null;
  sigla?: string | null;
  uf?: string | null;
  codigo_ibge?: number | null;
  nome?: string | null;
  g_pais?: ReferencialRecord | null;
  g_estado?: ReferencialRecord | null;
  a_tenant?: ReferencialRecord | null;
  a_orgao?: ReferencialRecord | null;
  a_tipo_unidade?: ReferencialRecord | null;
  g_municipio?: ReferencialRecord | null;
};
