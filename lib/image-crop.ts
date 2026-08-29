import type { Area } from "react-easy-crop";

function criarImagem(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (erro) => reject(erro));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

/**
 * Desenha só a área recortada (`areaRecorte`, em pixels da imagem original —
 * vem do `onCropComplete` do react-easy-crop) num canvas, escalando pra
 * nunca passar de `dimensoesMaximas` — a imagem final nunca é maior que o
 * definido em código pro campo (ícone/fundo de login), não importa o
 * tamanho do arquivo original enviado. `escala` só encolhe (nunca amplia
 * uma imagem pequena além do que ela já tem).
 */
export async function gerarImagemRecortada(
  imageSrc: string,
  areaRecorte: Area,
  dimensoesMaximas: { width: number; height: number },
): Promise<Blob> {
  const image = await criarImagem(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D não suportado neste navegador.");

  const escala = Math.min(1, dimensoesMaximas.width / areaRecorte.width, dimensoesMaximas.height / areaRecorte.height);
  canvas.width = Math.round(areaRecorte.width * escala);
  canvas.height = Math.round(areaRecorte.height * escala);

  ctx.drawImage(
    image,
    areaRecorte.x,
    areaRecorte.y,
    areaRecorte.width,
    areaRecorte.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar a imagem recortada."))), "image/png");
  });
}
