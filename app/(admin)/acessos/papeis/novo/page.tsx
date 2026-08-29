"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { PapelForm } from "@/features/admin/papeis/components/papel-form";
import { FormScreen } from "@/shared/ui";

export default function NovoPapelPage() {
  const router = useRouter();

  return (
    <FormScreen title="Novo papel" backHref={ROUTES.a_papeis_path} backLabel="Papéis">
      <PapelForm onDone={() => router.push(ROUTES.a_papeis_path)} />
    </FormScreen>
  );
}
