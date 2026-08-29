"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { cssVarDaFonte } from "@/theme/fonts";
import { ROUTES } from "@/lib/routes";
import { urlAbsoluta } from "@/services/api-institucional";
import { useConfiguracaoInstitucional } from "@/shared/hooks/use-configuracao-institucional";
import { SIDEBAR_SECTIONS } from "./navigation";

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: config } = useConfiguracaoInstitucional();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  // Overrides institucionais (Aparência → "Sidebar e topbar", ver
  // docs/APARENCIA-AVANCADA.md) — por cima do tema, nunca por baixo:
  // aplicados via `style` (sempre vence a classe Tailwind/DaisyUI por
  // especificidade), só quando o admin de fato definiu um valor. Sem
  // override nenhum, tudo aqui continua exatamente igual a antes desta
  // seção existir.
  const fonteSidebar = config?.fonte_sidebar ? cssVarDaFonte(config.fonte_sidebar) : undefined;
  const fonteTitulosSidebar = config?.fonte_titulos_sidebar ? cssVarDaFonte(config.fonte_titulos_sidebar) : undefined;
  const corSidebar = config?.cor_sidebar || undefined;
  const corTitulosSidebar = config?.cor_titulos_sidebar || undefined;
  const corRotasSidebar = config?.cor_rotas_sidebar || undefined;

  return (
    <div
      // Escala institucional (--app-scale) é do conteúdo, não do shell — a
      // largura da sidebar já tem o próprio dial (--sidebar-width, ver
      // AppShellPreview). Fixando --app-scale:1 aqui, todo padding/gap/ícone
      // interno (que usa --spacing e --font-size-*, ambos calc(base *
      // --app-scale)) volta a resolver no tamanho base, sem herdar a escala
      // do <html>.
      className="flex h-full w-(--sidebar-width) shrink-0 flex-col border-r border-base-300 bg-base-100"
      style={{ "--app-scale": 1, fontFamily: fonteSidebar, backgroundColor: corSidebar } as CSSProperties}
    >
      <div className="flex h-(--topbar-height) shrink-0 items-center gap-2.5 border-b border-base-300 px-5">
        <Link href={ROUTES.dashboard_path} className="flex min-w-0 items-center gap-2.5">
          {urlAbsoluta(config?.icone_sistema_url ?? null) && (
            // eslint-disable-next-line @next/next/no-img-element -- vem da API (host dinâmico via NEXT_PUBLIC_API_URL), next/image exige domínio fixo em next.config
            <img src={urlAbsoluta(config?.icone_sistema_url ?? null)!} alt="" className="size-7 shrink-0 rounded-md object-contain" />
          )}
          <span className="truncate text-base font-bold tracking-tight text-base-content" style={{ color: corTitulosSidebar, fontFamily: fonteTitulosSidebar }}>
            {config?.nome_sistema ?? "HTD Front"}
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <p
              className="px-3 pb-1 text-xs font-semibold tracking-[0.12em] text-base-content/50 uppercase"
              style={{ fontFamily: fonteTitulosSidebar, color: corTitulosSidebar }}
            >
              {section.title}
            </p>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
                        active ? "bg-primary/10 text-primary" : "text-base-content/70 hover:bg-base-200 hover:text-base-content",
                      )}
                      // Override de cor só no estado inativo — o ativo continua no
                      // primary do tema de propósito, é o sinal visual de seleção.
                      style={!active ? { color: corRotasSidebar } : undefined}
                    >
                      <Icon className="size-5 shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{item.label}</span>
                    </Link>

                    {item.children && active && (
                      <div className="mt-1 ml-8 flex flex-col gap-1 border-l border-base-300 pl-3">
                        {item.children.map((child) => {
                          const childActive = isActive(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onNavigate}
                              className={cn(
                                "rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                                childActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-base-content/60 hover:bg-base-200 hover:text-base-content",
                              )}
                              style={!childActive ? { color: corRotasSidebar } : undefined}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
