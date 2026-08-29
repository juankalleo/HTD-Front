import { z } from "zod";
import { MAX_STRING_LENGTH } from "@/lib/form-limits";

/**
 * Espelha `User` (api/app/models/user.rb): só `nome` presence, `email` sem
 * validação própria além do teto genérico de coluna `:string` (ver
 * `lib/form-limits.ts`). `.min(2)` já existiu aqui — achado real, mesma
 * classe de bug documentada em `docs/FORMULARIOS.md` (regra: nunca inventar
 * validação mais forte que o backend) — removido.
 */
export const configFormSchema = z.object({
  nome: z.string().min(1, "Informe o nome").max(MAX_STRING_LENGTH, `Máximo de ${MAX_STRING_LENGTH} caracteres`),
  email: z
    .string()
    .min(1, "Informe o e-mail")
    .email("E-mail inválido")
    .max(MAX_STRING_LENGTH, `Máximo de ${MAX_STRING_LENGTH} caracteres`),
});

export type ConfigFormValues = z.infer<typeof configFormSchema>;
