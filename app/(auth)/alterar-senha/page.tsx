import type { Metadata } from "next";
import { Suspense } from "react";
import { AlterarSenhaForm } from "@/features/autenticacao/alterar-senha/components/alterar-senha-form";

export const metadata: Metadata = {
  title: "Redefinir senha",
  description: "Criação de nova senha de acesso",
};

// useSearchParams (dentro do form) exige um boundary de Suspense.
export default function AlterarSenhaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Suspense fallback={null}>
        <AlterarSenhaForm />
      </Suspense>
    </div>
  );
}
