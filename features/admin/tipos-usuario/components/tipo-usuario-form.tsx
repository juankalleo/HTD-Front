"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/shared/forms/form-field";
import { MAX_STRING_LENGTH } from "@/lib/form-limits";
import { useCreateTipoUsuario } from "../hooks/use-create-tipo-usuario";
import { useUpdateTipoUsuario } from "../hooks/use-update-tipo-usuario";
import { tipoUsuarioFormSchema, type TipoUsuarioFormValues } from "../schemas/tipo-usuario.schema";
import type { ATipoUsuario } from "../types";

export function TipoUsuarioForm({ tipoUsuario, onDone }: { tipoUsuario?: ATipoUsuario; onDone: () => void }) {
  const { createTipoUsuario, isPending: isCreating } = useCreateTipoUsuario();
  const { updateTipoUsuario, isPending: isUpdating } = useUpdateTipoUsuario();
  const isSubmitting = isCreating || isUpdating;

  const form = useForm<TipoUsuarioFormValues>({
    resolver: zodResolver(tipoUsuarioFormSchema),
    defaultValues: { descricao: tipoUsuario?.descricao ?? "" },
  });

  useEffect(() => {
    form.reset({ descricao: tipoUsuario?.descricao ?? "" });
  }, [tipoUsuario, form]);

  const onSubmit = form.handleSubmit(async (valores) => {
    if (tipoUsuario) {
      await updateTipoUsuario(tipoUsuario.id, valores);
    } else {
      await createTipoUsuario(valores);
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
        label="Descrição"
        id="descricao"
        placeholder="Administrador"
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
