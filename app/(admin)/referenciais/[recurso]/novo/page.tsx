import { notFound } from "next/navigation";
import { ReferencialCreatePage } from "@/features/admin/referenciais/components/referencial-create-page";
import { getReferencialConfig, isReferencialKey } from "@/features/admin/referenciais/config";

export async function generateMetadata({ params }: { params: Promise<{ recurso: string }> }) {
  const { recurso } = await params;
  const config = getReferencialConfig(recurso);
  return { title: config ? `Novo ${config.singular} | Referenciais` : "Referenciais" };
}

export default async function NovoReferencialPage({ params }: { params: Promise<{ recurso: string }> }) {
  const { recurso } = await params;
  if (!isReferencialKey(recurso)) notFound();

  return <ReferencialCreatePage recurso={recurso} />;
}
