"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Toast } from "@/shared/ui";
import { useSession } from "@/features/autenticacao/login/hooks/use-session";
import { updateProfile } from "@/services/api-identity";
import { configFormSchema, type ConfigFormValues } from "../schemas/config.schema";

export function useConfigForm() {
  const { user, isLoading } = useSession();
  const queryClient = useQueryClient();

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: { nome: "", email: "" },
  });

  // Preenche o form assim que a sessão carrega — o form nasce vazio porque
  // o usuário ainda não chegou na primeira renderização.
  useEffect(() => {
    if (user) form.reset({ nome: user.nome, email: user.email });
  }, [user, form]);

  const mutation = useMutation({
    mutationFn: ({ nome, email }: ConfigFormValues) => updateProfile(nome, email),
    onSuccess: (resultado) => {
      if (!resultado.ok) {
        void Toast.error({ title: "Não foi possível salvar", description: resultado.message });
        return;
      }
      queryClient.setQueryData(["auth", "session"], resultado.user);
      void Toast.success({ title: "Perfil atualizado" });
    },
  });

  const onSubmit = form.handleSubmit((valores) => mutation.mutate(valores));

  return { form, onSubmit, isLoading, isSubmitting: mutation.isPending };
}
