"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoredUser } from "@/lib/auth";
import { redirectSeguro } from "@/lib/routes";
import { Toast } from "@/shared/ui";
import { signIn, type SessionUser } from "@/services/api-identity";
import { loginFormSchema, type LoginFormValues } from "../schemas/login.schema";

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: ({ email, password }: LoginFormValues) => signIn(email, password),
    onSuccess: (resultado) => {
      if (!resultado.ok) {
        void Toast.error({ title: "Não foi possível entrar", description: resultado.message });
        form.setError("password", { message: " " });
        return;
      }

      // Zera cache de uma sessão anterior antes de entrar como o novo usuário.
      queryClient.clear();
      const nome = getStoredUser<SessionUser>()?.nome;
      void Toast.success({ title: "Sessão iniciada", description: nome ? `Bem-vindo, ${nome}` : undefined });
      router.replace(redirectSeguro(searchParams.get("redirect")));
    },
  });

  const onSubmit = form.handleSubmit((valores) => mutation.mutate(valores));

  return { form, onSubmit, isSubmitting: mutation.isPending };
}
