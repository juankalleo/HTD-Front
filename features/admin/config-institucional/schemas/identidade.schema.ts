import { z } from "zod";
import { MAX_STRING_LENGTH } from "@/lib/form-limits";

/**
 * Espelha `CConfiguracao#nome_sistema` (presence). `.max()` é o teto
 * genérico real de coluna `:string` (ver `lib/form-limits.ts`). Os uploads
 * (`imagem_fundo_login`/`icone_sistema`) ficam fora do RHF — são `File`
 * simples em estado próprio no componente, não campo de formulário
 * validado por schema (ver identidade-form.tsx).
 */
export const identidadeFormSchema = z.object({
  nome_sistema: z.string().min(1, "Informe o nome do sistema").max(MAX_STRING_LENGTH, `Máximo de ${MAX_STRING_LENGTH} caracteres`),
});

export type IdentidadeFormValues = z.infer<typeof identidadeFormSchema>;
