"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/shared/forms/form-field";
import { MAX_PASSWORD_LENGTH, MAX_STRING_LENGTH } from "@/lib/form-limits";
import { useTiposUsuario } from "@/features/admin/tipos-usuario/hooks/use-tipos-usuario";
import { useCreateUsuario } from "../hooks/use-create-usuario";
import { useUpdateUsuario } from "../hooks/use-update-usuario";
import { usuarioFormSchema, type UsuarioFormValues } from "../schemas/usuario.schema";
import type { Usuario } from "../types";

export function UsuarioForm({ usuario, onDone }: { usuario?: Usuario; onDone: () => void }) {
  const { data: tipos } = useTiposUsuario();
  const { createUsuario, isPending: isCreating } = useCreateUsuario();
  const { updateUsuario, isPending: isUpdating } = useUpdateUsuario();
  const isSubmitting = isCreating || isUpdating;

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioFormSchema),
    defaultValues: {
      nome: usuario?.nome ?? "",
      // Backend não devolve e-mail em nenhuma resposta de admin — em edição
      // o campo nasce vazio mesmo, precisa ser redigitado se for trocar.
      email: "",
      aTipoUsuarioId: usuario?.a_tipo_usuario ? String(usuario.a_tipo_usuario.id) : "",
      password: "",
    },
  });

  useEffect(() => {
    form.reset({
      nome: usuario?.nome ?? "",
      email: "",
      aTipoUsuarioId: usuario?.a_tipo_usuario ? String(usuario.a_tipo_usuario.id) : "",
      password: "",
    });
  }, [usuario, form]);

  const onSubmit = form.handleSubmit(async (valores) => {
    if (usuario) {
      await updateUsuario(usuario.id, valores);
    } else {
      await createUsuario(valores);
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
        placeholder="Maria da Silva"
        maxLength={MAX_STRING_LENGTH}
        error={errors.nome?.message}
        {...register("nome")}
      />
      <FormField
        label={usuario ? "E-mail (deixe em branco pra manter o atual)" : "E-mail"}
        id="email"
        type="email"
        placeholder="maria.silva@empresa.com.br"
        maxLength={MAX_STRING_LENGTH}
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-base-content" htmlFor="aTipoUsuarioId">
          Tipo de usuário
        </label>
        <select id="aTipoUsuarioId" className="select w-full" {...register("aTipoUsuarioId")}>
          <option value="">Selecione...</option>
          {tipos?.items.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.descricao}
            </option>
          ))}
        </select>
        {errors.aTipoUsuarioId && <p className="text-xs font-medium text-error">{errors.aTipoUsuarioId.message}</p>}
      </div>

      <FormField
        label={usuario ? "Nova senha (deixe em branco pra manter a atual)" : "Senha"}
        id="password"
        type="password"
        placeholder="••••••••"
        maxLength={MAX_PASSWORD_LENGTH}
        error={errors.password?.message}
        {...register("password")}
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
