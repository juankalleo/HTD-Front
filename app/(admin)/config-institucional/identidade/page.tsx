import { IdentidadeForm } from "@/features/admin/config-institucional/components/identidade-form";
import { PageTitle } from "@/shared/ui";

export default function ConfigInstitucionalIdentidadePage() {
  return (
    <div className="px-6 py-10">
      <div className="w-full max-w-4xl">
        <PageTitle className="mb-1">Identidade institucional</PageTitle>
        <p className="mb-6 text-sm text-base-content/60">Nome, ícone e imagem de fundo do login que todo mundo vê.</p>
        <IdentidadeForm />
      </div>
    </div>
  );
}
