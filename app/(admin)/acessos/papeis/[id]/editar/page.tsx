"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { usePapel } from "@/features/admin/papeis/hooks/use-papel";
import { PapelForm } from "@/features/admin/papeis/components/papel-form";
import { FormScreen } from "@/shared/ui";

export default function EditarPapelPage({ params }: PageProps<"/acessos/papeis/[id]/editar">) {
  const { id } = use(params);
  const router = useRouter();
  const { data: papel, isLoading } = usePapel(Number(id));

  return (
    <FormScreen title="Editar papel" backHref={ROUTES.a_papeis_path} backLabel="Papéis">
      {isLoading && <p className="text-sm text-base-content/60">Carregando...</p>}
      {!isLoading && papel && <PapelForm papel={papel} onDone={() => router.push(ROUTES.a_papeis_path)} />}
    </FormScreen>
  );
}
