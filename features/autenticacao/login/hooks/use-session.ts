"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/services/api-identity";

/**
 * `staleTime` de 5min pra não bater `/auth/me` toda hora — login/logout
 * fazem `queryClient.clear()`, então a troca de usuário nunca serve cache
 * velho.
 */
export function useSession() {
  const query = useQuery({
    queryKey: ["auth", "session"],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
