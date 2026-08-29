"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getAccessToken } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

/**
 * Bloqueia a renderização do conteúdo até confirmar que existe token em
 * localStorage. Sem token, redireciona pro login.
 *
 * Como o token vive em localStorage (não em cookie), o check só pode
 * acontecer no client — daí o componente renderizar `null` na primeira
 * passada e liberar o conteúdo só depois de confirmar a sessão.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace(ROUTES.login_path);
      return;
    }
    const frame = window.requestAnimationFrame(() => setAuthorized(true));
    return () => window.cancelAnimationFrame(frame);
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3" role="status" aria-live="polite" aria-busy="true">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm text-base-content/60">Verificando sessão...</p>
      </div>
    );
  }

  return children;
}
