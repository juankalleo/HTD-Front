import { z } from "zod";
import { MAX_STRING_LENGTH } from "@/lib/form-limits";

/** Espelha `a_tipo_usuario_params` + o model (api/app/models/a_tipo_usuario.rb): só `descricao`, presence. `.max()` é o teto genérico real de coluna `:string` (ver `lib/form-limits.ts`). */
export const tipoUsuarioFormSchema = z.object({
  descricao: z.string().min(1, "Informe a descrição").max(MAX_STRING_LENGTH, `Máximo de ${MAX_STRING_LENGTH} caracteres`),
});

export type TipoUsuarioFormValues = z.infer<typeof tipoUsuarioFormSchema>;
