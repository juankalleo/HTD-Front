import { describe, expect, it } from "vitest";
import { ROUTES, redirectSeguro, withQuery } from "../routes";

describe("ROUTES", () => {
  it("expõe helpers com nomeação húngara no padrão Rails", () => {
    expect(ROUTES.m_usuarios_path).toBe("/usuarios");
    expect(ROUTES.new_m_usuario_path).toBe("/usuarios/novo");
    expect(ROUTES.edit_m_usuario_path(12)).toBe("/usuarios/12/editar");

    expect(ROUTES.a_tipo_usuarios_path).toBe("/tipos-usuario");
    expect(ROUTES.new_a_tipo_usuario_path).toBe("/tipos-usuario/novo");
    expect(ROUTES.edit_a_tipo_usuario_path(9)).toBe("/tipos-usuario/9/editar");
  });

  it("usa slug para coleção dinâmica e id para registro persistido", () => {
    expect(ROUTES.referencial_recurso_path("orgaos")).toBe("/referenciais/orgaos");
    expect(ROUTES.new_referencial_path("orgaos")).toBe("/referenciais/orgaos/novo");
    expect(ROUTES.edit_referencial_path("orgaos", 7)).toBe("/referenciais/orgaos/7/editar");
  });

  it("codifica segmentos e volta para a coleção quando falta id ou slug", () => {
    expect(ROUTES.edit_a_papel_path(undefined)).toBe(ROUTES.a_papeis_path);
    expect(ROUTES.edit_referencial_path("", 7)).toBe(ROUTES.admin_referenciais_path);
    expect(ROUTES.edit_referencial_path("tipos unidade", "A/B")).toBe("/referenciais/tipos%20unidade/A%2FB/editar");
  });
});

describe("withQuery", () => {
  it("monta query string ignorando valores vazios", () => {
    expect(withQuery(ROUTES.relatorios_usuarios_path, { busca: "Ana Silva", tipo: "", ativo: true })).toBe(
      "/relatorios/usuarios?busca=Ana+Silva&ativo=true",
    );
  });

  it("repete chave quando o filtro recebe lista", () => {
    expect(withQuery(ROUTES.relatorios_orgaos_path, { status: ["ativo", "pendente"], vazio: null })).toBe(
      "/relatorios/orgaos?status=ativo&status=pendente",
    );
  });
});

describe("redirectSeguro", () => {
  it("aceita caminhos internos", () => {
    expect(redirectSeguro(ROUTES.m_usuarios_path)).toBe(ROUTES.m_usuarios_path);
  });

  it("bloqueia URL absoluta, protocolo relativo e valor vazio", () => {
    expect(redirectSeguro("https://exemplo.com")).toBe(ROUTES.dashboard_path);
    expect(redirectSeguro("//exemplo.com")).toBe(ROUTES.dashboard_path);
    expect(redirectSeguro(null)).toBe(ROUTES.dashboard_path);
  });
});
