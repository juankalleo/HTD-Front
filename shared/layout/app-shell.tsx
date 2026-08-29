"use client";

import { AuthGuard } from "@/features/autenticacao/login/components/auth-guard";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

function fecharDrawerMobile() {
  const checkbox = document.getElementById("app-drawer") as HTMLInputElement | null;
  if (checkbox) checkbox.checked = false;
}

/**
 * Shell da área logada: sidebar + topbar + guarda de sessão, igual o
 * `ClientDashboardShell` da otica, só que mais simples (sem colapsar a
 * sidebar) — drawer no mobile é puro CSS/HTML do DaisyUI (checkbox +
 * label), sem listener de clique fora.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="drawer min-h-screen lg:drawer-open">
        <input id="app-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex min-h-screen flex-col">
          <AppHeader />
          <main className="flex-1 bg-base-200/40">{children}</main>
        </div>
        <div className="drawer-side z-50">
          <label htmlFor="app-drawer" aria-label="Fechar menu" className="drawer-overlay" />
          <AppSidebar onNavigate={fecharDrawerMobile} />
        </div>
      </div>
    </AuthGuard>
  );
}
