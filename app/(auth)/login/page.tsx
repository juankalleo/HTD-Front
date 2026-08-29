import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/autenticacao/login/components/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Acesso ao sistema",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
