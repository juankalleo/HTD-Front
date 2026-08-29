"use client";

import { FormField } from "@/shared/forms/form-field";
import { MAX_PASSWORD_LENGTH } from "@/lib/form-limits";
import { useAlterarSenhaForm } from "../hooks/use-alterar-senha-form";
import { PageTitle } from "@/shared/ui";

export function AlterarSenhaForm() {
  const { form, onSubmit, hasToken, isSubmitting } = useAlterarSenhaForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="w-full max-w-sm space-y-5">
      <div>
        <PageTitle>Redefinir senha</PageTitle>
        <p className="mt-1 text-sm text-base-content/60">Crie uma nova senha para acessar o sistema.</p>
      </div>

      {hasToken ? (
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-4">
            <FormField
              label="Nova senha"
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              maxLength={MAX_PASSWORD_LENGTH}
              error={errors.password?.message}
              {...register("password")}
            />
            <FormField
              label="Confirme a senha"
              id="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              maxLength={MAX_PASSWORD_LENGTH}
              error={errors.passwordConfirmation?.message}
              {...register("passwordConfirmation")}
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
            {isSubmitting ? "Salvando..." : "Salvar e entrar"}
          </button>
        </form>
      ) : (
        <p className="text-sm font-medium text-error">
          Link inválido ou ausente. Abra o link que enviamos no seu e-mail para redefinir a senha.
        </p>
      )}
    </div>
  );
}
