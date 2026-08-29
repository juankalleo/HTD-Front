import { describe, expect, it } from "vitest";
import { extrairErroDeCampo, extrairMensagem } from "../error-utils";

describe("extrairMensagem", () => {
  it("prioriza message no topo do payload", () => {
    expect(extrairMensagem({ message: "Falha validada" }, "Fallback")).toBe("Falha validada");
  });

  it("usa primeiro erro de validação quando errors existir", () => {
    expect(extrairMensagem({ errors: { email: ["já está em uso"] } }, "Fallback")).toBe("já está em uso");
  });

  it("lê envelope error.message e error.details", () => {
    expect(extrairMensagem({ error: { message: "Sem permissão" } }, "Fallback")).toBe("Sem permissão");
    expect(extrairMensagem({ error: { details: [{ field: "nome", message: "é obrigatório" }] } }, "Fallback")).toBe(
      "nome: é obrigatório",
    );
  });

  it("trata erro de rede sem resposta", () => {
    const error = { isAxiosError: true, message: "Network Error" };
    expect(extrairMensagem(error, "Fallback")).toBe("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
  });

  it("não vaza mensagem técnica de status HTTP", () => {
    expect(extrairMensagem(new Error("Request failed with status code 422"), "Fallback")).toBe("Fallback");
  });
});

describe("extrairErroDeCampo", () => {
  it("extrai erro vindo em errors", () => {
    expect(extrairErroDeCampo({ errors: { email: ["inválido"] } }, "email")).toBe("inválido");
  });

  it("extrai erro vindo em error.details", () => {
    const error = { error: { details: [{ field: "email", message: "inválido" }] } };
    expect(extrairErroDeCampo(error, "email")).toBe("inválido");
  });
});
