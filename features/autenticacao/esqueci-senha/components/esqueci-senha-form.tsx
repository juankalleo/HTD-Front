"use client";

import Link from "next/link";
import { FormField } from "@/shared/forms/form-field";
import { MAX_STRING_LENGTH } from "@/lib/form-limits";
import { ROUTES } from "@/lib/routes";
import { useEsqueciSenhaForm } from "../hooks/use-esqueci-senha-form";
import { PageTitle } from "@/shared/ui";

export function EsqueciSenhaForm() {
  const { form, onSubmit, isSubmitting } = useEsqueciSenhaForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
      <div>
        <PageTitle>Esqueceu a senha?</PageTitle>
        <p className="mt-1 text-sm text-base-content/60">Informe seu e-mail e enviaremos um link pra você criar uma nova senha.</p>
      </div>

      <FormField
        label="E-mail"
        id="email"
        type="email"
        placeholder="voce@empresa.com.br"
        autoComplete="email"
        maxLength={MAX_STRING_LENGTH}
        error={errors.email?.message}
        {...register("email")}
      />

      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
        {isSubmitting ? "Enviando..." : "Enviar link"}
      </button>

      <p className="text-center text-xs text-base-content/50">
        <Link href={ROUTES.login_path} className="link link-hover">
          Voltar para o login
        </Link>
      </p>
    </form>
  );
}
