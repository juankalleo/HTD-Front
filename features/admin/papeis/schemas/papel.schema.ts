import { z } from "zod";
import { MAX_STRING_LENGTH } from "@/lib/form-limits";

/**
 * Espelha `a_papel_params` + as validações reais do model (api/app/models/a_papel.rb):
 * `nome` e `descricao` são `presence: true` os dois — nenhum é opcional.
 * `.max()` é o teto genérico real de coluna `:string` (ver `lib/form-limits.ts`).
 */
export const papelFormSchema = z.object({
  nome: z.string().min(1, "Informe o nome").max(MAX_STRING_LENGTH, `Máximo de ${MAX_STRING_LENGTH} caracteres`),
  descricao: z.string().min(1, "Informe a descrição").max(MAX_STRING_LENGTH, `Máximo de ${MAX_STRING_LENGTH} caracteres`),
});

export type PapelFormValues = z.infer<typeof papelFormSchema>;
