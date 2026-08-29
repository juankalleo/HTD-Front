# Layout da aplicação

> Documentação viva da Fase 7 do [`ROADMAP.md`](ROADMAP.md). Equivalente ao
> `ClientDashboardShell` da `otica` — sidebar + topbar + guarda de sessão
> em volta de toda área logada.

## As três peças, `shared/layout/`

```
shared/layout/
  app-shell.tsx     # composição: AuthGuard + drawer (mobile) + AppSidebar + AppHeader + <main>
  app-sidebar.tsx    # navegação lateral
  app-header.tsx     # topbar (menu mobile + conta do usuário)
  navigation.ts       # dado: seções e itens da sidebar
```

`AppShell` é o único ponto que cada `layout.tsx` de route group precisa
importar:

```tsx
// app/(admin)/layout.tsx, app/(dashboard)/layout.tsx, app/(config)/layout.tsx
import { AppShell } from "@/shared/layout/app-shell";
export default function Layout({ children }) {
  return <AppShell>{children}</AppShell>;
}
```

## Drawer mobile: CSS puro do DaisyUI, sem JS de estado

`drawer` (checkbox + label, DaisyUI) em vez de `useState` + listener de
clique fora — o checkbox invisível *é* o estado (marcado = drawer aberto),
o CSS decide o resto via seletor irmão. Menos JS, menos re-render, e não
tem race condition entre "clique fechou" e "clique abriu de novo".

```tsx
<div className="drawer min-h-screen lg:drawer-open">
  <input id="app-drawer" type="checkbox" className="drawer-toggle" />
  <div className="drawer-content">...</div>
  <div className="drawer-side">
    <label htmlFor="app-drawer" className="drawer-overlay" />
    <AppSidebar onNavigate={fecharDrawerMobile} />
  </div>
</div>
```

`fecharDrawerMobile()` só existe pra fechar o drawer **depois** de navegar
(clicar num link do menu, no mobile) — manipula o checkbox direto via
`document.getElementById`, a única exceção ao "sem JS de estado" porque
navegação não dispara o clique no overlay sozinha.

## `navigation.ts` — dado, não JSX

A sidebar não tem `<Link>` hardcoded por item — itera um array tipado:

```ts
export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavSection = { title: string; items: NavItem[] };

export const SIDEBAR_SECTIONS: NavSection[] = [
  { title: "Principal", items: [{ href: "/dashboard", label: "Início", icon: LayoutDashboard }] },
  { title: "Administração", items: [
    { href: "/usuarios", label: "Usuários", icon: Users },
    { href: "/tipos-usuario", label: "Tipos de usuário", icon: Tags },
    { href: "/acessos/papeis", label: "Papéis", icon: Shield },
    { href: "/acessos/permissoes", label: "Permissões", icon: KeyRound },
  ] },
  { title: "Institucional", items: [
    { href: "/config-institucional/aparencia", label: "Aparência", icon: Palette },
    { href: "/config-institucional/identidade", label: "Identidade", icon: Building2 },
  ] },
  { title: "Sistema", items: [{ href: "/config", label: "Configurações", icon: Settings }] },
];
```

Adicionar um item de menu é editar este array — nunca mexer em
`app-sidebar.tsx` pra isso. O item ativo é calculado por `usePathname()`
comparado contra `href` (match exato ou prefixo — `/usuarios/novo` também
acende "Usuários").

## Tamanho: institucional, arrastável — não hardcoded

Largura da sidebar e altura da topbar **não** são `w-64`/`h-14` fixos no
Tailwind — são CSS custom properties (`--sidebar-width`, `--topbar-height`)
setadas no `<html>` pelo layout raiz, a partir da configuração
institucional (arrastável pelo admin em Aparência). Ver
[`CONFIGURACAO-INSTITUCIONAL.md`](CONFIGURACAO-INSTITUCIONAL.md).

```tsx
<div className="flex h-full w-(--sidebar-width) shrink-0 ...">
```

`w-(--sidebar-width)` é a sintaxe curta do Tailwind v4 pra `w-[var(--x)]`.

## Marca e avatar: institucional e por-usuário

O nome exibido no topo da sidebar (`config?.nome_sistema ?? "base-front"`)
vem de `useConfiguracaoInstitucional()` (`shared/hooks/`, ver
[`DADOS-E-API.md`](DADOS-E-API.md)) — não é mais um texto fixo `"base-front"`
no componente. O avatar do usuário no topbar (`AppHeader`) usa
`getInitials`/`getAvatarColors` (`lib/avatar.ts`) em vez de um ícone
genérico — iniciais do nome, cor estável derivada de um hash do próprio
nome (mesmo usuário sempre tem a mesma cor, sem precisar guardar cor no
banco).
