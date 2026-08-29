import { describe, expect, it } from "vitest";
import { contarPorGrupo, percentual, texto, textoCurto } from "../relatorio-utils";

describe("relatorio-utils", () => {
  it("normaliza texto com fallback", () => {
    expect(texto("  Órgão  ")).toBe("Órgão");
    expect(texto(42)).toBe("42");
    expect(texto(null)).toBe("-");
  });

  it("encurta texto longo", () => {
    expect(textoCurto("Secretaria Municipal", 10)).toBe("Secretaria...");
    expect(textoCurto("Curto", 10)).toBe("Curto");
  });

  it("calcula percentual sem dividir por zero", () => {
    expect(percentual(2, 4)).toBe(50);
    expect(percentual(2, 0)).toBe(0);
  });

  it("conta grupos e ordena por total depois por label", () => {
    const grupos = contarPorGrupo(
      [
        { tipo: { id: 1, nome: "B" } },
        { tipo: { id: 2, nome: "A" } },
        { tipo: { id: 2, nome: "A" } },
        { tipo: null },
      ],
      (item) => ({ id: item.tipo?.id, label: item.tipo?.nome }),
      "Sem tipo",
    );

    expect(grupos).toEqual([
      { id: "2", label: "A", total: 2 },
      { id: "1", label: "B", total: 1 },
      { id: "__sem_vinculo__", label: "Sem tipo", total: 1 },
    ]);
  });
});
