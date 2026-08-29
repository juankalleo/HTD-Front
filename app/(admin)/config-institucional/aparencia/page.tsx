import { AparenciaForm } from "@/features/admin/config-institucional/components/aparencia-form";
import { PageTitle } from "@/shared/ui";

export default function ConfigInstitucionalAparenciaPage() {
  return (
    <div className="px-6 py-10">
      <div className="w-full max-w-4xl">
        <PageTitle className="mb-1">Aparência institucional</PageTitle>
        <p className="mb-6 text-sm text-base-content/60">
          Tema, fonte, escala e tamanho da sidebar/topbar padrão pra todo mundo que acessa o sistema.
        </p>
        <AparenciaForm />
      </div>
    </div>
  );
}
