import { notFound } from "next/navigation";
import { ReferencialEditPage } from "@/features/admin/referenciais/components/referencial-edit-page";
import { getReferencialConfig, isReferencialKey } from "@/features/admin/referenciais/config";

export async function generateMetadata({ params }: { params: Promise<{ recurso: string; id: string }> }) {
  const { recurso } = await params;
  const config = getReferencialConfig(recurso);
  return { title: config ? `Editar ${config.singular} | Referenciais` : "Referenciais" };
}

export default async function EditarReferencialPage({ params }: { params: Promise<{ recurso: string; id: string }> }) {
  const { recurso, id } = await params;
  if (!isReferencialKey(recurso)) notFound();

  return <ReferencialEditPage recurso={recurso} id={id} />;
}
