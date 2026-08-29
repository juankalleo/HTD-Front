import { AppShell } from "@/shared/layout/app-shell";

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
