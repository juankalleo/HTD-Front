"use client";

import { Check, Palette } from "@/theme/icons";
import { cn } from "@/lib/cn";
import { TEMAS_DISPONIVEIS, type TemaValor } from "../constants";
import { useTheme } from "../hooks/use-theme";

/**
 * Seletor de tema no estilo DaisyUI (`theme-controller`): grade de cards,
 * cada um com preview da paleta do tema aplicada via `data-theme` no
 * próprio card (então mostra as cores de verdade, sem trocar o tema da
 * página). Controlado por fora (`value`/`onSelect`) quando usado em um
 * formulário; sem props, usa o tema pessoal salvo (`useTheme`).
 */
export function ThemePicker({
  value,
  onSelect,
}: { value?: TemaValor; onSelect?: (valor: TemaValor) => void } = {}) {
  const { tema, setTema } = useTheme();
  const atual = value ?? tema;
  const selecionar = onSelect ?? setTema;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {TEMAS_DISPONIVEIS.map((opcao) => {
        const selecionado = atual === opcao.valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            onClick={() => selecionar(opcao.valor)}
            aria-pressed={selecionado}
            className={cn(
              "group relative rounded-lg border p-1.5 text-left transition-colors",
              selecionado ? "border-primary ring-2 ring-primary" : "border-base-300 hover:border-base-content/40",
            )}
          >
            {selecionado && (
              <span className="absolute right-2 top-2 z-10 grid size-4 place-items-center rounded-full bg-primary text-primary-content">
                <Check className="size-3" />
              </span>
            )}
            <div
              data-theme={opcao.valor}
              className="mb-2 flex h-12 items-center gap-1 rounded-md border border-base-300 bg-base-100 p-1.5"
            >
              <span className="h-full w-3 rounded-sm bg-primary" />
              <span className="h-full w-3 rounded-sm bg-secondary" />
              <span className="h-full w-3 rounded-sm bg-accent" />
              <span className="h-full w-3 rounded-sm bg-neutral" />
              <span className="h-full flex-1 rounded-sm bg-base-200" />
            </div>
            <span className="flex items-center gap-1 truncate text-xs font-medium text-base-content">
              <Palette className="size-3.5 opacity-50" />
              {opcao.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
