"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { TipoUsuarioForm } from "@/features/admin/tipos-usuario/components/tipo-usuario-form";
import { FormScreen } from "@/shared/ui";

export default function NovoTipoUsuarioPage() {
  const router = useRouter();

  return (
    <FormScreen title="Novo tipo de usuário" backHref={ROUTES.a_tipo_usuarios_path} backLabel="Tipos de usuário">
      <TipoUsuarioForm onDone={() => router.push(ROUTES.a_tipo_usuarios_path)} />
    </FormScreen>
  );
}
