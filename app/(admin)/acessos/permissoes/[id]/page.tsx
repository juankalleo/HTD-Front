"use client";

import { use } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { usePapel } from "@/features/admin/papeis/hooks/use-papel";
import { PapelPermissoesMatrix } from "@/features/admin/permissoes/components/papel-permissoes-matrix";
import { PageTitle } from "@/shared/ui";

export default function PapelPermissoesPage({ params }: PageProps<"/acessos/permissoes/[id]">) {
  const { id } = use(params);
  const papelId = Number(id);
  const { data: papel, isLoading } = usePapel(papelId);

  return (
    <div className="px-6 py-10">
      <div className="w-full">
        <Link href={ROUTES.a_permissoes_path} className="link link-hover text-sm text-base-content/60">
          ← Permissões
        </Link>
        <PageTitle className="mt-2 mb-1">
          {isLoading ? "Carregando..." : `Permissões de "${papel?.nome}"`}
        </PageTitle>
        <p className="mb-6 text-sm text-base-content/60">
          Marque as combinações de recurso × ação que este papel deve ter.
        </p>

        <PapelPermissoesMatrix papelId={papelId} />
      </div>
    </div>
  );
}
