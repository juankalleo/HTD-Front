import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { PageTitle } from "@/shared/ui";
import { REFERENCIAIS, REFERENCIAL_KEYS } from "../config";

export function ReferenciaisHome() {
  const grupos = REFERENCIAL_KEYS.reduce<Record<string, typeof REFERENCIAL_KEYS>>((acc, key) => {
    const group = REFERENCIAIS[key].group;
    acc[group] ??= [];
    acc[group].push(key);
    return acc;
  }, {});

  return (
    <div className="w-full space-y-6">
      <div>
        <PageTitle>Referenciais</PageTitle>
        <p className="mt-1 max-w-3xl text-sm text-base-content/60">
          Cadastros de referência expostos pela API em `/api/v1/admin/*`: geografia, organização institucional e unidades administrativas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Object.entries(grupos).map(([grupo, keys]) => (
          <section key={grupo} className="space-y-3">
            <h2 className="text-sm font-semibold tracking-[0.12em] text-base-content/50 uppercase">{grupo}</h2>
            <div className="grid gap-3">
              {keys.map((key) => {
                const config = REFERENCIAIS[key];
                return (
                  <Link
                    key={key}
                    href={ROUTES.referencial_recurso_path(key)}
                    className="rounded-lg border border-base-300 bg-base-100 p-4 transition-colors hover:border-primary/40 hover:bg-base-200/60"
                  >
                    <span className="block font-semibold text-base-content">{config.title}</span>
                    <span className="mt-1 block text-sm text-base-content/60">{config.description}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
