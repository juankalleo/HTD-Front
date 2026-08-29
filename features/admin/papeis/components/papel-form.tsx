"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/shared/forms/form-field";
import { MAX_STRING_LENGTH } from "@/lib/form-limits";
import { useCreatePapel } from "../hooks/use-create-papel";
import { useUpdatePapel } from "../hooks/use-update-papel";
import { papelFormSchema, type PapelFormValues } from "../schemas/papel.schema";
import type { APapel } from "../types";

export function PapelForm({ papel, onDone }: { papel?: APapel; onDone: () => void }) {
  const { createPapel, isPending: isCreating } = useCreatePapel();
  const { updatePapel, isPending: isUpdating } = useUpdatePapel();
  const isSubmitting = isCreating || isUpdating;

  const form = useForm<PapelFormValues>({
    resolver: zodResolver(papelFormSchema),
    defaultValues: { nome: papel?.nome ?? "", descricao: papel?.descricao ?? "" },
  });

  useEffect(() => {
    form.reset({ nome: papel?.nome ?? "", descricao: papel?.descricao ?? "" });
  }, [papel, form]);

  const onSubmit = form.handleSubmit(async (valores) => {
    if (papel) {
      await updatePapel(papel.id, valores);
    } else {
      await createPapel(valores);
    }
    onDone();
  });

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <FormField
        label="Nome"
        id="nome"
        placeholder="Gestor financeiro"
        maxLength={MAX_STRING_LENGTH}
        error={errors.nome?.message}
        {...register("nome")}
      />
      <FormField
        label="Descrição"
        id="descricao"
        placeholder="Acesso a relatórios e lançamentos financeiros"
        maxLength={MAX_STRING_LENGTH}
        error={errors.descricao?.message}
        {...register("descricao")}
      />

      <div className="modal-action md:col-span-2">
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
