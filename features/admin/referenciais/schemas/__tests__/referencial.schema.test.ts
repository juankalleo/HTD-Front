import { describe, expect, it } from "vitest";
import { REFERENCIAIS, buildReferencialBody } from "../../config";
import { buildReferencialSchema } from "../referencial.schema";

describe("buildReferencialSchema", () => {
  it("exige campos obrigatórios", () => {
    const schema = buildReferencialSchema(REFERENCIAIS.orgaos);
    const result = schema.safeParse({ nome: "", a_tenant_id: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.nome?.[0]).toBe("Informe nome");
      expect(result.error.flatten().fieldErrors.a_tenant_id?.[0]).toBe("Selecione tenant");
    }
  });

  it("aceita campo opcional vazio", () => {
    const schema = buildReferencialSchema(REFERENCIAIS.unidades);
    const result = schema.safeParse({
      nome: "Unidade Central",
      a_orgao_id: "1",
      a_tipo_unidade_id: "2",
      g_municipio_id: "",
    });

    expect(result.success).toBe(true);
  });
});

describe("buildReferencialBody", () => {
  it("converte number para número e opcional vazio para null", () => {
    expect(
      buildReferencialBody(REFERENCIAIS.municipios, {
        descricao: "Porto Velho",
        codigo_ibge: "1100205",
        g_estado_id: "",
      }),
    ).toEqual({
      g_municipio: {
        descricao: "Porto Velho",
        codigo_ibge: 1100205,
        g_estado_id: "",
      },
    });

    expect(
      buildReferencialBody(REFERENCIAIS.unidades, {
        nome: "Unidade Central",
        a_orgao_id: "1",
        a_tipo_unidade_id: "2",
        g_municipio_id: "",
      }),
    ).toEqual({
      a_unidade: {
        nome: "Unidade Central",
        a_orgao_id: "1",
        a_tipo_unidade_id: "2",
        g_municipio_id: null,
      },
    });
  });
});
