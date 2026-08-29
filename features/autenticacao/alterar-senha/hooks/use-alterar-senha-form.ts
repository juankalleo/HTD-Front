"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ROUTES } from "@/lib/routes";
import { Toast } from "@/shared/ui";
import { resetPassword } from "@/services/api-identity";
import { alterarSenhaSchema, type AlterarSenhaFormValues } from "../schemas/alterar-senha.schema";

export function useAlterarSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const form = useForm<AlterarSenhaFormValues>({
    resolver: zodResolver(alterarSenhaSchema),
    defaultValues: { password: "", passwordConfirmation: "" },
  });

  const mutation = useMutation({
    mutationFn: ({ password }: AlterarSenhaFormValues) => resetPassword(token, password),
    onSuccess: (resultado) => {
      if (!resultado.ok) {
        void Toast.error({ title: "Não foi possível redefinir a senha", description: resultado.message });
        return;
      }
      // Nunca autentica direto depois do reset — o usuário confirma a troca
      // fazendo login de verdade com a senha nova (OWASP Forgot Password
      // Cheat Sheet: reset não deve logar automaticamente).
      void Toast.success({ title: "Senha redefinida", description: "Faça login com a nova senha." });
      router.push(ROUTES.login_path);
    },
  });

  const onSubmit = form.handleSubmit((valores) => mutation.mutate(valores));

  return { form, onSubmit, hasToken: Boolean(token), isSubmitting: mutation.isPending };
}
