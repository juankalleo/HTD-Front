import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { PageTitle } from "@/shared/ui";

/** Página global 404: rotas inexistentes e chamadas a `notFound()` sem `not-found` mais específico. */
export function NotFoundView() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <PageTitle>Página não encontrada</PageTitle>
      <p className="max-w-sm text-sm text-base-content/60">O endereço não existe ou foi movido. Confira o link digitado ou volte ao início.</p>
      <Link href={ROUTES.dashboard_path} className="btn btn-primary">
        Ir para o início
      </Link>
    </div>
  );
}
