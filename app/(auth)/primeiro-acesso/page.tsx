import type { Metadata } from "next";
import { Suspense } from "react";
import { PrimeiroAcessoForm } from "@/features/autenticacao/primeiro-acesso/components/primeiro-acesso-form";

export const metadata: Metadata = {
  title: "Primeiro acesso",
  description: "Definição da senha de acesso",
};

// useSearchParams (dentro do form) exige um boundary de Suspense.
export default function PrimeiroAcessoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Suspense fallback={null}>
        <PrimeiroAcessoForm />
      </Suspense>
    </div>
  );
}
