"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ROUTES } from "@/lib/routes";
import { Toast } from "@/shared/ui";
import { completeFirstAccess } from "@/services/api-identity";
import { primeiroAcessoSchema, type PrimeiroAcessoFormValues } from "../schemas/primeiro-acesso.schema";

export function usePrimeiroAcessoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const form = useForm<PrimeiroAcessoFormValues>({
    resolver: zodResolver(primeiroAcessoSchema),
    defaultValues: { password: "", passwordConfirmation: "" },
  });

  const mutation = useMutation({
    mutationFn: ({ password }: PrimeiroAcessoFormValues) => completeFirstAccess(token, password),
    onSuccess: (resultado) => {
      if (!resultado.ok) {
        void Toast.error({ title: "Não foi possível definir a senha", description: resultado.message });
        return;
      }
      // completeFirstAccess já autentica (guarda token/usuário) quando implementado — entra direto.
      void Toast.success({ title: "Senha definida", description: "Tudo certo! Você já está logado." });
      router.push(ROUTES.dashboard_path);
    },
  });

  const onSubmit = form.handleSubmit((valores) => mutation.mutate(valores));

  return { form, onSubmit, hasToken: Boolean(token), isSubmitting: mutation.isPending };
}
