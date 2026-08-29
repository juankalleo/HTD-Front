"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/lib/routes";
import { signOut } from "@/services/api-identity";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: signOut,
    // `onSettled` roda no sucesso E no erro: sempre limpa cache e vai pro
    // login, mesmo se a chamada falhar. `replace` evita voltar pra tela
    // logada pelo botão voltar.
    onSettled: () => {
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.replace(ROUTES.login_path);
        return;
      }
      router.replace(ROUTES.login_path);
    },
  });

  return { logout: () => mutation.mutate(), isLoggingOut: mutation.isPending };
}
