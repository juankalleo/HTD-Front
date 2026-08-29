import { z } from "zod";
import { MAX_STRING_LENGTH } from "@/lib/form-limits";

export const esqueciSenhaSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail")
    .email("E-mail inválido")
    .max(MAX_STRING_LENGTH, `Máximo de ${MAX_STRING_LENGTH} caracteres`),
});

export type EsqueciSenhaFormValues = z.infer<typeof esqueciSenhaSchema>;
