import { z } from "zod";

/** Espelha `CConfiguracao::COR_HEX_REGEX` na api/ — usado tanto pro `<input type="color">` (sempre produz esse formato) quanto pra validar entrada. */
export const CorHexRegex = /^#[0-9a-fA-F]{6}$/;

const corOpcional = z.string().regex(CorHexRegex, "Cor inválida").or(z.literal(""));
/** Fonte: string livre de propósito — o `<select>` (`FONTES_INSTITUCIONAIS`) já restringe a opção; `""` = sem override (herda o tema/fonte do sistema). */
const fonteOpcional = z.string();

/** Espelha `CConfiguracao::TEMAS/FONTES/ESCALAS` na api/ — vocabulário fechado, mas o <select> já restringe a opção, então basta presence aqui. */
export const aparenciaFormSchema = z.object({
  tema: z.string().min(1, "Selecione um tema"),
  fonte: z.string().min(1, "Selecione uma fonte"),
  // String (não z.coerce.number()) de propósito — mesmo padrão do
  // aTipoUsuarioId em usuario.schema.ts: <select> só devolve string, a
  // conversão pra número fica no ponto de uso (ver aparencia-form.tsx).
  escala: z.string().min(1, "Selecione uma escala"),
  // Overrides de sidebar/topbar — todos opcionais ("" = sem override, ver
  // docs/APARENCIA-AVANCADA.md). Nunca exigidos: o form tem que
  // continuar válido com todos vazios (comportamento de hoje, sem override
  // nenhum).
  fonte_sidebar: fonteOpcional,
  fonte_titulos_sidebar: fonteOpcional,
  fonte_topbar: fonteOpcional,
  cor_titulos_sidebar: corOpcional,
  cor_sidebar: corOpcional,
  cor_rotas_sidebar: corOpcional,
  cor_topbar: corOpcional,
  // Tamanho do título de página — vocabulário fechado, sempre tem valor
  // (não é override opcional como os de cima).
  tamanho_titulo_pagina: z.string().min(1, "Selecione um tamanho"),
  // Cor de borda/texto do sistema — mesmo "" = sem override dos de cima.
  cor_borda_sistema: corOpcional,
  cor_borda_tabela: corOpcional,
  cor_texto_sistema: corOpcional,
});

export type AparenciaFormValues = z.infer<typeof aparenciaFormSchema>;
