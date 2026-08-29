"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { UsuarioForm } from "@/features/admin/usuarios/components/usuario-form";
import { FormScreen } from "@/shared/ui";

export default function NovoUsuarioPage() {
  const router = useRouter();

  return (
    <FormScreen title="Novo usuário" backHref={ROUTES.m_usuarios_path} backLabel="Usuários">
      <UsuarioForm onDone={() => router.push(ROUTES.m_usuarios_path)} />
    </FormScreen>
  );
}
