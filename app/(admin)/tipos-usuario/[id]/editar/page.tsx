"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { useTipoUsuario } from "@/features/admin/tipos-usuario/hooks/use-tipo-usuario";
import { TipoUsuarioForm } from "@/features/admin/tipos-usuario/components/tipo-usuario-form";
import { FormScreen } from "@/shared/ui";

export default function EditarTipoUsuarioPage({ params }: PageProps<"/tipos-usuario/[id]/editar">) {
  const { id } = use(params);
  const router = useRouter();
  const { data: tipoUsuario, isLoading } = useTipoUsuario(Number(id));

  return (
    <FormScreen title="Editar tipo de usuário" backHref={ROUTES.a_tipo_usuarios_path} backLabel="Tipos de usuário">
      {isLoading && <p className="text-sm text-base-content/60">Carregando...</p>}
      {!isLoading && tipoUsuario && (
        <TipoUsuarioForm tipoUsuario={tipoUsuario} onDone={() => router.push(ROUTES.a_tipo_usuarios_path)} />
      )}
    </FormScreen>
  );
}
