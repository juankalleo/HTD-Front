"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { FormField } from "@/shared/forms/form-field";
import { MAX_PASSWORD_LENGTH, MAX_STRING_LENGTH } from "@/lib/form-limits";
import { AUTH_DEMO_EMAIL, AUTH_DEMO_PASSWORD } from "../constants";
import { useLoginForm } from "../hooks/use-login-form";
import { PageTitle } from "@/shared/ui";

export function LoginForm() {
  const { form, onSubmit, isSubmitting } = useLoginForm();
  const searchParams = useSearchParams();
  const sessaoExpirada = searchParams.get("expirado") === "1";
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
      <div>
        <PageTitle>Entrar</PageTitle>
        <p className="mt-1 text-sm text-base-content/60">Bem-vindo(a) de volta! Informe seus dados.</p>
      </div>

      {sessaoExpirada && (
        <p role="alert" className="rounded-lg bg-warning/10 px-3.5 py-2.5 text-sm font-medium text-warning">
          Sua sessão expirou. Faça login novamente.
        </p>
      )}

      <div className="space-y-4">
        <FormField
          label="E-mail"
          id="email"
          type="email"
          placeholder="voce@empresa.com.br"
          autoComplete="username"
          maxLength={MAX_STRING_LENGTH}
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="Senha"
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          maxLength={MAX_PASSWORD_LENGTH}
          error={errors.password?.message}
          {...register("password")}
        />
        <Link href={ROUTES.esqueci_senha_path} className="link link-hover block text-right text-xs text-base-content/60">
          Esqueceu a senha?
        </Link>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>

      {!process.env.NEXT_PUBLIC_API_URL && (
        <p className="text-center text-xs text-base-content/50">
          Modo demo: <span className="font-mono">{AUTH_DEMO_EMAIL}</span> / <span className="font-mono">{AUTH_DEMO_PASSWORD}</span>
        </p>
      )}
    </form>
  );
}
