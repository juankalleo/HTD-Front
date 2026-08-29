"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area } from "react-easy-crop";
import { gerarImagemRecortada } from "@/lib/image-crop";
import { Toast } from "./toast";

/**
 * Modal padrão pra recorte/posicionamento de imagem antes do upload — usado
 * hoje em Identidade institucional (ícone do sistema, fundo do login), e é
 * o padrão pra qualquer campo de imagem novo do projeto (ver
 * `docs/UPLOAD-DE-IMAGEM.md`). Sempre entrega uma imagem já dentro de
 * `dimensoesMaximas`, na proporção `aspect` — o backend nunca recebe um
 * arquivo fora do tamanho/enquadramento esperado pro campo.
 */
export function ImageCropperModal({
  arquivo,
  aspect,
  dimensoesMaximas,
  nomeArquivoSaida,
  onConfirmar,
  onCancelar,
}: {
  arquivo: File | null;
  aspect: number;
  dimensoesMaximas: { width: number; height: number };
  nomeArquivoSaida: string;
  onConfirmar: (arquivoRecortado: File) => void;
  onCancelar: () => void;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaRecortePixels, setAreaRecortePixels] = useState<Area | null>(null);
  const [isProcessando, setIsProcessando] = useState(false);
  const [arquivoAnterior, setArquivoAnterior] = useState<File | null | undefined>(undefined);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Ajusta o estado durante a renderização (não em efeito) pra trocar de arquivo sem
  // disparar o lint de "setState síncrono em efeito" — ver https://react.dev/learn/you-might-not-need-an-effect
  if (arquivo !== arquivoAnterior) {
    setArquivoAnterior(arquivo);
    setImageSrc(arquivo ? URL.createObjectURL(arquivo) : null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  // Atributo `open` sozinho nunca entra no top layer do navegador (sem foco
  // preso, sem fechar no Esc, sem role="dialog" implícito) — só `showModal()`
  // faz isso, e ele já cuida do atributo `open` sozinho (por isso não tem
  // `open` no JSX abaixo). O backdrop visual continua vindo de `.modal[open]`
  // do DaisyUI (CSS puro), então isso não muda nada visual. `useLayoutEffect`
  // (não `useEffect`) pra abrir antes do navegador pintar o primeiro frame —
  // sem isso, um `<dialog>` sem `open` pisca sem estilo de modal por um frame.
  // Listener de "close" cobre o Esc (único jeito de fechar sem passar pelos
  // botões, que já chamam onCancelar/onConfirmar direto).
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !imageSrc) return;
    if (!dialog.open) dialog.showModal();
    dialog.addEventListener("close", onCancelar);
    return () => dialog.removeEventListener("close", onCancelar);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onCancelar só precisa fechar sobre o setter estável (useState), não precisa disparar reattach
  }, [imageSrc]);

  async function confirmar() {
    if (!imageSrc || !areaRecortePixels) return;

    setIsProcessando(true);
    try {
      const blob = await gerarImagemRecortada(imageSrc, areaRecortePixels, dimensoesMaximas);
      onConfirmar(new File([blob], nomeArquivoSaida, { type: "image/png" }));
    } catch {
      void Toast.error({ title: "Não foi possível recortar a imagem", description: "Tente novamente." });
    } finally {
      setIsProcessando(false);
    }
  }

  if (!arquivo || !imageSrc) return null;

  // Portal pro <body>: o modal é aberto de dentro de formulários (ex.: Identidade
  // institucional), e o backdrop do DaisyUI usa <form method="dialog">. Sem portal,
  // isso viraria um <form> dentro de outro <form> — HTML inválido e erro de hidratação.
  return createPortal(
    <dialog ref={dialogRef} className="modal" aria-labelledby="image-cropper-titulo">
      <div className="modal-box max-w-lg">
        <h3 id="image-cropper-titulo" className="mb-3 text-lg font-bold text-base-content">Posicionar imagem</h3>

        <div className="relative h-72 w-full overflow-hidden rounded-lg bg-base-300">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, areaPixels) => setAreaRecortePixels(areaPixels)}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-base-content/60">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="range range-primary range-sm"
          />
        </div>
        <p className="mt-2 text-xs text-base-content/60">Arraste pra posicionar. A imagem final sai em até {dimensoesMaximas.width}×{dimensoesMaximas.height}px.</p>

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" disabled={isProcessando} onClick={() => void confirmar()}>
            {isProcessando ? "Processando..." : "Usar imagem"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancelar}>fechar</button>
      </form>
    </dialog>,
    document.body,
  );
}
