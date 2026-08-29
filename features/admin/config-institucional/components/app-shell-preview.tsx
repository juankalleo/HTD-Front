"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/cn";

const PREVIEW_WIDTH = 640;
const PREVIEW_HEIGHT = 320;

type Alvo = "sidebar" | "topbar";

function clamp(valor: number, min: number, max: number) {
  return Math.max(min, Math.min(max, valor));
}

/**
 * Maquete arrastável do shell (sidebar + topbar) — o admin seleciona a
 * borda da sidebar ou da topbar e arrasta pra redimensionar, vendo o
 * resultado na hora. Escala visual: mapeia largura/altura reais (px do
 * shell de verdade) pro tamanho fixo do canvas da maquete.
 */
export function AppShellPreview({
  larguraSidebar,
  alturaTopbar,
  larguraMin,
  larguraMax,
  alturaMin,
  alturaMax,
  onChangeLargura,
  onChangeAltura,
  corSidebar,
  corTitulosSidebar,
  corRotasSidebar,
  corTopbar,
}: {
  larguraSidebar: number;
  alturaTopbar: number;
  larguraMin: number;
  larguraMax: number;
  alturaMin: number;
  alturaMax: number;
  onChangeLargura: (valor: number) => void;
  onChangeAltura: (valor: number) => void;
  /** Overrides de cor (Sidebar e topbar, ver `AparenciaForm`) — string vazia = sem override, usa o tema como hoje. */
  corSidebar?: string;
  corTitulosSidebar?: string;
  corRotasSidebar?: string;
  corTopbar?: string;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [arrastando, setArrastando] = useState<Alvo | null>(null);

  const escalaLargura = PREVIEW_WIDTH / (larguraMax + 80);
  const escalaAltura = PREVIEW_HEIGHT / (alturaMax + 120);

  const larguraPreview = larguraSidebar * escalaLargura;
  const alturaPreview = alturaTopbar * escalaAltura;

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!arrastando || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    if (arrastando === "sidebar") {
      const x = event.clientX - rect.left;
      onChangeLargura(clamp(Math.round(x / escalaLargura), larguraMin, larguraMax));
    } else {
      const y = event.clientY - rect.top;
      onChangeAltura(clamp(Math.round(y / escalaAltura), alturaMin, alturaMax));
    }
  }

  function iniciarArrasto(alvo: Alvo) {
    return (event: ReactPointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setArrastando(alvo);
    };
  }

  function pararArrasto(event: ReactPointerEvent<HTMLDivElement>) {
    setArrastando(null);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-base-content">Tamanho da sidebar e da topbar</span>
        <span className="text-base-content/60">
          {larguraSidebar}px · {alturaTopbar}px
        </span>
      </div>
      <p className="text-xs text-base-content/60">Arraste a borda da sidebar ou da topbar na maquete abaixo.</p>

      <div
        ref={canvasRef}
        className="relative touch-none overflow-hidden rounded-lg border border-base-300 bg-base-200 select-none"
        style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT, maxWidth: "100%" }}
        onPointerMove={handlePointerMove}
      >
        {/* Sidebar */}
        <div
          className="absolute inset-y-0 left-0 flex flex-col gap-1.5 border-r border-base-300 bg-base-100 p-2"
          style={{ width: larguraPreview, backgroundColor: corSidebar || undefined }}
        >
          <div className="h-2 w-3/4 rounded bg-base-content/25" style={{ backgroundColor: corTitulosSidebar || undefined }} />
          <div className="mt-2 h-1.5 w-full rounded bg-primary/40" style={{ backgroundColor: corRotasSidebar || undefined }} />
          <div className="h-1.5 w-5/6 rounded bg-base-content/15" style={{ backgroundColor: corRotasSidebar ? `${corRotasSidebar}40` : undefined }} />
          <div className="h-1.5 w-5/6 rounded bg-base-content/15" style={{ backgroundColor: corRotasSidebar ? `${corRotasSidebar}40` : undefined }} />
          <div className="h-1.5 w-2/3 rounded bg-base-content/15" style={{ backgroundColor: corRotasSidebar ? `${corRotasSidebar}40` : undefined }} />
        </div>

        {/* Topbar */}
        <div
          className="absolute top-0 right-0 border-b border-base-300 bg-base-100"
          style={{ left: larguraPreview, height: alturaPreview, backgroundColor: corTopbar || undefined }}
        />

        {/* Conteúdo (decorativo) */}
        <div className="absolute right-0 bottom-0 space-y-1.5 p-3" style={{ left: larguraPreview, top: alturaPreview }}>
          <div className="h-1.5 w-1/3 rounded bg-base-content/10" />
          <div className="h-1.5 w-1/2 rounded bg-base-content/10" />
        </div>

        {/* Alça da sidebar */}
        <div
          role="slider"
          aria-label="Largura da sidebar"
          aria-valuenow={larguraSidebar}
          aria-valuemin={larguraMin}
          aria-valuemax={larguraMax}
          tabIndex={0}
          onPointerDown={iniciarArrasto("sidebar")}
          onPointerUp={pararArrasto}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") onChangeLargura(clamp(larguraSidebar - 4, larguraMin, larguraMax));
            if (event.key === "ArrowRight") onChangeLargura(clamp(larguraSidebar + 4, larguraMin, larguraMax));
          }}
          className={cn(
            "absolute top-0 flex h-full w-3 -translate-x-1/2 cursor-col-resize items-center justify-center outline-none",
            arrastando === "sidebar" && "bg-primary/10",
          )}
          style={{ left: larguraPreview }}
        >
          <div className="h-9 w-1 rounded-full bg-primary" />
        </div>

        {/* Alça da topbar */}
        <div
          role="slider"
          aria-label="Altura da topbar"
          aria-valuenow={alturaTopbar}
          aria-valuemin={alturaMin}
          aria-valuemax={alturaMax}
          tabIndex={0}
          onPointerDown={iniciarArrasto("topbar")}
          onPointerUp={pararArrasto}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp") onChangeAltura(clamp(alturaTopbar - 2, alturaMin, alturaMax));
            if (event.key === "ArrowDown") onChangeAltura(clamp(alturaTopbar + 2, alturaMin, alturaMax));
          }}
          className={cn(
            "absolute right-0 flex h-3 -translate-y-1/2 cursor-row-resize items-center justify-center outline-none",
            arrastando === "topbar" && "bg-primary/10",
          )}
          style={{ left: larguraPreview, top: alturaPreview, width: PREVIEW_WIDTH - larguraPreview }}
        >
          <div className="h-1 w-9 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
