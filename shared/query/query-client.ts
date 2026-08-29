"use client";

import { QueryCache, QueryClient } from "@tanstack/react-query";
import { extrairMensagem } from "@/lib/error-utils";
import { Toast } from "@/shared/ui/sistema";

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.data !== undefined) return;
        if (query.meta?.suppressGlobalErrorToast === true) return;

        void Toast.error({
          title: "Não foi possível carregar os dados",
          description: extrairMensagem(error, "Tente novamente."),
        });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });
}
