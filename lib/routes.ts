export type RouteId = string | number | null | undefined;
export type RouteSlug = string | null | undefined;
export type RouteQueryValue = string | number | boolean | null | undefined;
export type RouteQuery = Record<string, RouteQueryValue | RouteQueryValue[]>;

function routeSegment(value: RouteId | RouteSlug): string | null {
  if (value === null || value === undefined) return null;
  const segment = String(value).trim();
  return segment ? encodeURIComponent(segment) : null;
}

function collectionPath(base: string, slug: RouteSlug, fallback = base) {
  const segment = routeSegment(slug);
  return segment ? `${base}/${segment}` : fallback;
}

function memberPath(base: string, id: RouteId, fallback = base) {
  const segment = routeSegment(id);
  return segment ? `${base}/${segment}` : fallback;
}

function newMemberPath(base: string, slug?: RouteSlug, fallback = base) {
  const collection = slug === undefined ? base : collectionPath(base, slug, fallback);
  return collection === fallback && slug !== undefined ? fallback : `${collection}/novo`;
}

function editMemberPath(base: string, id: RouteId, fallback = base) {
  const member = memberPath(base, id, fallback);
  return member === fallback ? fallback : `${member}/editar`;
}

function editNestedMemberPath(base: string, slug: RouteSlug, id: RouteId, fallback = base) {
  const collection = collectionPath(base, slug, fallback);
  if (collection === fallback) return fallback;

  const member = memberPath(collection, id, collection);
  return member === collection ? collection : `${member}/editar`;
}

function addQueryParam(search: URLSearchParams, key: string, value: RouteQueryValue) {
  if (value === null || value === undefined || value === "") return;
  search.append(key, String(value));
}

export function withQuery(path: string, params?: RouteQuery): string {
  if (!params) return path;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => addQueryParam(search, key, item));
      continue;
    }
    addQueryParam(search, key, value);
  }

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

const REFERENCIAIS_BASE_PATH = "/referenciais";

export const ROUTES = {
  root_path: "/",
  dashboard_path: "/dashboard",

  login_path: "/login",
  esqueci_senha_path: "/esqueci-senha",
  alterar_senha_path: "/alterar-senha",
  primeiro_acesso_path: "/primeiro-acesso",

  m_usuarios_path: "/usuarios",
  m_usuario_path: (id: RouteId) => memberPath("/usuarios", id),
  new_m_usuario_path: "/usuarios/novo",
  edit_m_usuario_path: (id: RouteId) => editMemberPath("/usuarios", id),

  a_tipo_usuarios_path: "/tipos-usuario",
  a_tipo_usuario_path: (id: RouteId) => memberPath("/tipos-usuario", id),
  new_a_tipo_usuario_path: "/tipos-usuario/novo",
  edit_a_tipo_usuario_path: (id: RouteId) => editMemberPath("/tipos-usuario", id),

  acessos_path: "/acessos",
  a_papeis_path: "/acessos/papeis",
  a_papel_path: (id: RouteId) => memberPath("/acessos/papeis", id, "/acessos/papeis"),
  new_a_papel_path: "/acessos/papeis/novo",
  edit_a_papel_path: (id: RouteId) => editMemberPath("/acessos/papeis", id, "/acessos/papeis"),
  a_permissoes_path: "/acessos/permissoes",
  a_papel_permissoes_path: (id: RouteId) => memberPath("/acessos/permissoes", id, "/acessos/permissoes"),

  admin_referenciais_path: REFERENCIAIS_BASE_PATH,
  referencial_recurso_path: (recurso: RouteSlug) => collectionPath(REFERENCIAIS_BASE_PATH, recurso, REFERENCIAIS_BASE_PATH),
  new_referencial_path: (recurso: RouteSlug) => newMemberPath(REFERENCIAIS_BASE_PATH, recurso, REFERENCIAIS_BASE_PATH),
  edit_referencial_path: (recurso: RouteSlug, id: RouteId) => editNestedMemberPath(REFERENCIAIS_BASE_PATH, recurso, id, REFERENCIAIS_BASE_PATH),

  g_paises_path: "/referenciais/paises",
  g_pais_path: (id: RouteId) => memberPath("/referenciais/paises", id, "/referenciais/paises"),
  new_g_pais_path: "/referenciais/paises/novo",
  edit_g_pais_path: (id: RouteId) => editMemberPath("/referenciais/paises", id, "/referenciais/paises"),

  g_estados_path: "/referenciais/estados",
  g_estado_path: (id: RouteId) => memberPath("/referenciais/estados", id, "/referenciais/estados"),
  new_g_estado_path: "/referenciais/estados/novo",
  edit_g_estado_path: (id: RouteId) => editMemberPath("/referenciais/estados", id, "/referenciais/estados"),

  g_municipios_path: "/referenciais/municipios",
  g_municipio_path: (id: RouteId) => memberPath("/referenciais/municipios", id, "/referenciais/municipios"),
  new_g_municipio_path: "/referenciais/municipios/novo",
  edit_g_municipio_path: (id: RouteId) => editMemberPath("/referenciais/municipios", id, "/referenciais/municipios"),

  a_tenants_path: "/referenciais/tenants",
  a_tenant_path: (id: RouteId) => memberPath("/referenciais/tenants", id, "/referenciais/tenants"),
  new_a_tenant_path: "/referenciais/tenants/novo",
  edit_a_tenant_path: (id: RouteId) => editMemberPath("/referenciais/tenants", id, "/referenciais/tenants"),

  a_orgaos_path: "/referenciais/orgaos",
  a_orgao_path: (id: RouteId) => memberPath("/referenciais/orgaos", id, "/referenciais/orgaos"),
  new_a_orgao_path: "/referenciais/orgaos/novo",
  edit_a_orgao_path: (id: RouteId) => editMemberPath("/referenciais/orgaos", id, "/referenciais/orgaos"),

  a_tipos_unidade_path: "/referenciais/tipos-unidade",
  a_tipo_unidade_path: (id: RouteId) => memberPath("/referenciais/tipos-unidade", id, "/referenciais/tipos-unidade"),
  new_a_tipo_unidade_path: "/referenciais/tipos-unidade/novo",
  edit_a_tipo_unidade_path: (id: RouteId) => editMemberPath("/referenciais/tipos-unidade", id, "/referenciais/tipos-unidade"),

  a_unidades_path: "/referenciais/unidades",
  a_unidade_path: (id: RouteId) => memberPath("/referenciais/unidades", id, "/referenciais/unidades"),
  new_a_unidade_path: "/referenciais/unidades/novo",
  edit_a_unidade_path: (id: RouteId) => editMemberPath("/referenciais/unidades", id, "/referenciais/unidades"),

  relatorios_usuarios_path: "/relatorios/usuarios",
  relatorios_usuarios_pdf_preview_path: "/relatorios/usuarios/pdf-preview",
  relatorios_usuarios_excel_preview_path: "/relatorios/usuarios/excel-preview",
  relatorios_orgaos_path: "/relatorios/orgaos",
  relatorios_unidades_path: "/relatorios/unidades",

  config_institucional_aparencia_path: "/config-institucional/aparencia",
  config_institucional_identidade_path: "/config-institucional/identidade",
  config_path: "/config",

  logs_path: "/logs",
  log_path: (id: RouteId) => memberPath("/logs", id, "/logs"),

  // Aliases legados: mantidos para não quebrar fluxos existentes durante a migração.
  login: "/login",
  home: "/dashboard",
};

/**
 * Só aceita redirect interno (evita open redirect via `//host` ou URL
 * absoluta) — mesma proteção usada no next-locacao, sem a parte de papel
 * (aqui não há área por papel ainda).
 */
export function redirectSeguro(redirect: string | null): string {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return ROUTES.dashboard_path;
  }
  return redirect;
}
