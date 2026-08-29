import { z } from "zod";
import { MAX_PASSWORD_LENGTH, MAX_STRING_LENGTH } from "@/lib/form-limits";

/**
 * Espelha `user_params` + as validações reais (api/app/models/user.rb: só
 * `nome` presence; Devise `password_length = 6..128` em config/initializers/
 * devise.rb — não inventar regra mais forte que o backend). `nome`/`email`
 * levam `.max(MAX_STRING_LENGTH)` porque isso não é inventado: é o teto
 * genérico real de qualquer coluna `:string` (`ApplicationRecord`, ver
 * `lib/form-limits.ts`), sempre ativo no backend. Senha em branco na
 * edição significa "não trocar" — só entra no corpo da requisição se
 * preenchida (ver `use-update-usuario.ts`).
 */
export const usuarioFormSchema = z.object({
  nome: z.string().min(1, "Informe o nome").max(MAX_STRING_LENGTH, `Máximo de ${MAX_STRING_LENGTH} caracteres`),
  email: z
    .string()
    .min(1, "Informe o e-mail")
    .email("E-mail inválido")
    .max(MAX_STRING_LENGTH, `Máximo de ${MAX_STRING_LENGTH} caracteres`),
  aTipoUsuarioId: z.string().min(1, "Selecione um tipo de usuário"),
  password: z
    .string()
    .min(6, "Mínimo de 6 caracteres")
    .max(MAX_PASSWORD_LENGTH, `Máximo de ${MAX_PASSWORD_LENGTH} caracteres`)
    .or(z.literal("")),
});

export type UsuarioFormValues = z.infer<typeof usuarioFormSchema>;
