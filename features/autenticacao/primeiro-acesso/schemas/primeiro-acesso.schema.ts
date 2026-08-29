import { z } from "zod";
import { MAX_PASSWORD_LENGTH } from "@/lib/form-limits";

export const primeiroAcessoSchema = z
  .object({
    password: z.string().min(6, "Mínimo de 6 caracteres").max(MAX_PASSWORD_LENGTH, `Máximo de ${MAX_PASSWORD_LENGTH} caracteres`),
    passwordConfirmation: z
      .string()
      .min(6, "Mínimo de 6 caracteres")
      .max(MAX_PASSWORD_LENGTH, `Máximo de ${MAX_PASSWORD_LENGTH} caracteres`),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não conferem",
    path: ["passwordConfirmation"],
  });

export type PrimeiroAcessoFormValues = z.infer<typeof primeiroAcessoSchema>;
