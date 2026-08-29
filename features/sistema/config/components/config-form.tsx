"use client";

import { FormField } from "@/shared/forms/form-field";
import { MAX_STRING_LENGTH } from "@/lib/form-limits";
import { ThemePicker } from "@/features/sistema/temas/components/theme-picker";
import { useConfigForm } from "../hooks/use-config-form";
import { PageTitle } from "@/shared/ui";

export function ConfigForm() {
  const { form, onSubmit, isLoading, isSubmitting } = useConfigForm();
  const {
    register,
    formState: { errors },
  } = form;

  if (isLoading) {
    return <p className="text-sm text-base-content/60">Carregando perfil...</p>;
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div>
        <PageTitle>Configurações</PageTitle>
        <p className="mt-1 text-sm text-base-content/60">Ajuste seu nome, e-mail e preferências.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-4">
          <FormField
            label="Nome"
            id="nome"
            placeholder="Maria da Silva"
            maxLength={MAX_STRING_LENGTH}
            error={errors.nome?.message}
            {...register("nome")}
          />
          <FormField
            label="E-mail"
            id="email"
            type="email"
            placeholder="maria.silva@empresa.com.br"
            maxLength={MAX_STRING_LENGTH}
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      <div className="border-t border-base-300 pt-6">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Tema</legend>
          <ThemePicker />
          <p className="label">Aplica na hora, salvo pra próxima visita.</p>
        </fieldset>
      </div>
    </div>
  );
}
