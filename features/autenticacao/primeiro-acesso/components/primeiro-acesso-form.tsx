"use client";

import { FormField } from "@/shared/forms/form-field";
import { MAX_PASSWORD_LENGTH } from "@/lib/form-limits";
import { usePrimeiroAcessoForm } from "../hooks/use-primeiro-acesso-form";
import { PageTitle } from "@/shared/ui";

export function PrimeiroAcessoForm() {
  const { form, onSubmit, hasToken, isSubmitting } = usePrimeiroAcessoForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="w-full max-w-sm space-y-5">
      <div>
        <PageTitle>Defina sua senha</PageTitle>
        <p className="mt-1 text-sm text-base-content/60">Crie uma nova senha para concluir seu primeiro acesso ao sistema.</p>
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
          Link inválido ou ausente. Abra o link que enviamos no seu e-mail para concluir o primeiro acesso.
        </p>
      )}
    </div>
  );
}
