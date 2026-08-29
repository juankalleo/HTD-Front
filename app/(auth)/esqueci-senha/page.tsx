import type { Metadata } from "next";
import { Suspense } from "react";
import { EsqueciSenhaForm } from "@/features/autenticacao/esqueci-senha/components/esqueci-senha-form";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
  description: "Recuperação de senha",
};

export default function EsqueciSenhaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Suspense fallback={null}>
        <EsqueciSenhaForm />
      </Suspense>
    </div>
  );
}
