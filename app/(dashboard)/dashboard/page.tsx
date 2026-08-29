"use client";

import { useSession } from "@/features/autenticacao/login/hooks/use-session";
import { PageTitle } from "@/shared/ui";

export default function DashboardPage() {
  const { user, isLoading } = useSession();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <PageTitle>Início</PageTitle>
      <p className="text-sm text-base-content/60">
        {isLoading ? "Carregando sessão..." : user ? `Logado como ${user.nome} (${user.email})` : "Sem sessão"}
      </p>
    </div>
  );
}
