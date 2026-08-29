import { notFound } from "next/navigation";
import { ReferencialList } from "@/features/admin/referenciais/components/referencial-list";
import { getReferencialConfig, isReferencialKey } from "@/features/admin/referenciais/config";

export async function generateMetadata({ params }: { params: Promise<{ recurso: string }> }) {
  const { recurso } = await params;
  const config = getReferencialConfig(recurso);
  return { title: config ? `${config.title} | Referenciais` : "Referenciais" };
}

export default async function ReferencialPage({ params }: { params: Promise<{ recurso: string }> }) {
  const { recurso } = await params;
  if (!isReferencialKey(recurso)) notFound();

  return (
    <div className="px-6 py-10">
      <ReferencialList recurso={recurso} />
    </div>
  );
}
