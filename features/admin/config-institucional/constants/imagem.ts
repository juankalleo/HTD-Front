/**
 * Tamanho máximo (em código, não "de olho") de cada campo de imagem da
 * Identidade institucional — o admin recorta/posiciona na proporção certa
 * antes de enviar (ver `shared/ui/sistema/image-cropper-modal.tsx`), então o
 * arquivo que chega no backend já nasce dentro do limite, nunca precisa de
 * validação de dimensão do lado do Rails.
 */
export const TAMANHO_MAXIMO_ARQUIVO_MB = 5;

export const ICONE_SISTEMA_RECORTE = {
  aspect: 1,
  dimensoesMaximas: { width: 512, height: 512 },
};

export const IMAGEM_FUNDO_LOGIN_RECORTE = {
  aspect: 16 / 9,
  dimensoesMaximas: { width: 1920, height: 1080 },
};
