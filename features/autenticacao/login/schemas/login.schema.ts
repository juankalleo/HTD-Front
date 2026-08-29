import { z } from "zod";
import { MAX_PASSWORD_LENGTH, MAX_STRING_LENGTH } from "@/lib/form-limits";

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail")
    .email("E-mail inválido")
    .max(MAX_STRING_LENGTH, `Máximo de ${MAX_STRING_LENGTH} caracteres`),
  password: z.string().min(1, "Informe a senha").max(MAX_PASSWORD_LENGTH, `Máximo de ${MAX_PASSWORD_LENGTH} caracteres`),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
