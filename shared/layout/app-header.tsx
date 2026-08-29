"use client";

import type { CSSProperties } from "react";
import { useSession } from "@/features/autenticacao/login/hooks/use-session";
import { useLogout } from "@/features/autenticacao/logout/hooks/use-logout";
import { getInitials, getAvatarColors } from "@/lib/avatar";
import { cssVarDaFonte } from "@/theme/fonts";
import { useConfiguracaoInstitucional } from "@/shared/hooks/use-configuracao-institucional";
import { Menu, LogOut } from "@/theme/icons";

export function AppHeader() {
  const { user } = useSession();
  const { logout, isLoggingOut } = useLogout();
  const { data: config } = useConfiguracaoInstitucional();
  const avatar = user?.nome ? getAvatarColors(user.nome) : null;

  // Overrides institucionais (Aparência → "Sidebar e topbar", ver
  // docs/APARENCIA-AVANCADA.md e o mesmo raciocínio em app-sidebar.tsx)
  // — só aplicados quando o admin de fato definiu um valor.
  const fonteTopbar = config?.fonte_topbar ? cssVarDaFonte(config.fonte_topbar) : undefined;
  const corTopbar = config?.cor_topbar || undefined;

  return (
    // Escala institucional é do conteúdo, não do shell — mesmo raciocínio
    // do AppSidebar (--app-scale:1 fixo, altura já tem o próprio dial via
    // --topbar-height).
    <header
      className="flex h-(--topbar-height) shrink-0 items-center gap-3 border-b border-base-300 bg-base-100 px-5"
      style={{ "--app-scale": 1, fontFamily: fonteTopbar, backgroundColor: corTopbar } as CSSProperties}
    >
      <label htmlFor="app-drawer" className="btn btn-ghost btn-square lg:hidden" aria-label="Abrir menu">
        <Menu className="size-6" strokeWidth={1.75} />
      </label>

      <div className="dropdown dropdown-end ml-auto">
        <button type="button" tabIndex={0} className="btn btn-ghost gap-2.5">
          <span
            className="flex size-8 items-center justify-center rounded-full text-xs font-bold"
            style={avatar ? { backgroundColor: avatar.bg, color: avatar.text } : undefined}
          >
            {user?.nome ? getInitials(user.nome) : "?"}
          </span>
          <span className="max-w-40 truncate text-[15px] font-medium">{user?.nome ?? "Sessão ativa"}</span>
        </button>
        <ul tabIndex={0} className="dropdown-content menu z-50 mt-2 w-60 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
          <li className="px-3 py-2.5">
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[15px] font-semibold text-base-content">{user?.nome ?? "—"}</span>
              <span className="text-sm text-base-content/60">{user?.email ?? ""}</span>
            </div>
          </li>
          <li>
            <button type="button" onClick={() => logout()} disabled={isLoggingOut} className="py-2.5 text-[15px] text-error">
              <LogOut className="size-[18px]" strokeWidth={1.8} />
              {isLoggingOut ? "Saindo..." : "Sair do sistema"}
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
}
