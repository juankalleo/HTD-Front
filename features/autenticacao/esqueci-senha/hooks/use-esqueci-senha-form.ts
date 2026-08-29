"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Toast } from "@/shared/ui";
import { requestPasswordReset } from "@/services/api-identity";
import { esqueciSenhaSchema, type EsqueciSenhaFormValues } from "../schemas/esqueci-senha.schema";

export function useEsqueciSenhaForm() {
  const form = useForm<EsqueciSenhaFormValues>({
    resolver: zodResolver(esqueciSenhaSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: ({ email }: EsqueciSenhaFormValues) => requestPasswordReset(email),
    onSuccess: (resultado) => {
      if (!resultado.ok) {
        void Toast.error({ title: "Não foi possível enviar", description: resultado.message });
        return;
      }
      // Resposta sempre genérica (o back não revela se o e-mail existe).
      void Toast.success({
        title: "Verifique seu e-mail",
        description: "Se o e-mail estiver cadastrado, enviamos um link para você redefinir a senha.",
        timer: 6000,
      });
      form.reset({ email: "" });
    },
  });

  const onSubmit = form.handleSubmit((valores) => mutation.mutate(valores));

  return { form, onSubmit, isSubmitting: mutation.isPending };
}
