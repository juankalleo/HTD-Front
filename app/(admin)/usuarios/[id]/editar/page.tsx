"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { useUsuario } from "@/features/admin/usuarios/hooks/use-usuario";
import { UsuarioForm } from "@/features/admin/usuarios/components/usuario-form";
import { FormScreen } from "@/shared/ui";

export default function EditarUsuarioPage({ params }: PageProps<"/usuarios/[id]/editar">) {
  const { id } = use(params);
  const router = useRouter();
  const { data: usuario, isLoading } = useUsuario(Number(id));

  return (
    <FormScreen title="Editar usuário" backHref={ROUTES.m_usuarios_path} backLabel="Usuários">
      {isLoading && <p className="text-sm text-base-content/60">Carregando...</p>}
      {!isLoading && usuario && <UsuarioForm usuario={usuario} onDone={() => router.push(ROUTES.m_usuarios_path)} />}
    </FormScreen>
  );
}
