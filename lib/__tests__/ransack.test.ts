import { describe, expect, it } from "vitest";
import { sortingParaRansack } from "../ransack";

describe("sortingParaRansack", () => {
  it("retorna undefined sem ordenação", () => {
    expect(sortingParaRansack([])).toBeUndefined();
  });

  it("converte primeira coluna para q[s]", () => {
    expect(sortingParaRansack([{ id: "nome", desc: false }])).toBe("nome asc");
    expect(sortingParaRansack([{ id: "created_at", desc: true }])).toBe("created_at desc");
  });

  it("ignora ordenações adicionais", () => {
    expect(
      sortingParaRansack([
        { id: "nome", desc: false },
        { id: "email", desc: true },
      ]),
    ).toBe("nome asc");
  });
});
