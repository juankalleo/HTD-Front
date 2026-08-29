# Upload de imagem: recorte antes de enviar

> Documentação viva de um padrão que surgiu da Identidade institucional
> (ícone do sistema, imagem de fundo do login — ver
> [`CONFIGURACAO-INSTITUCIONAL.md`](CONFIGURACAO-INSTITUCIONAL.md)), mas
> vale pra qualquer campo de imagem novo do projeto.

## O problema que isso resolve

Todo campo de imagem do sistema tem tamanho máximo definido **em código**
(ex.: ícone do sistema sai em até 512×512px, fundo do login em até
1920×1080px — ver `ICONE_SISTEMA_RECORTE`/`IMAGEM_FUNDO_LOGIN_RECORTE`
abaixo). Sem recorte, o admin escolhe um arquivo de qualquer proporção e
tamanho, e o resultado final (esticado, cortado errado pelo `object-cover`
do CSS, ou simplesmente gigante) só aparece depois de salvar — quando já é
tarde pra ajustar. O admin precisa **posicionar** a imagem antes de enviar,
não só escolher um arquivo e torcer.

## A biblioteca: react-easy-crop

Ver [`tecnologias/react-easy-crop.md`](tecnologias/react-easy-crop.md) pro
molde completo (versão, import, por quê). Resumo: é headless (só
`transform`/`overflow`, sem folha de estilo própria) — encaixa dentro de um
modal DaisyUI sem trazer um segundo design system, e devolve só a **área**
recortada em pixels; o processamento do arquivo em si (canvas, redimensionar
pro tamanho máximo) é responsabilidade nossa, não da lib.

## O padrão: três peças

```
arquivo escolhido (<input type="file">)
        │
        ▼
valida tamanho máximo (TAMANHO_MAXIMO_ARQUIVO_MB)
        │
        ▼
ImageCropperModal — usuário arrasta/dá zoom pra posicionar
        │  (shared/ui/sistema/image-cropper-modal.tsx)
        ▼
gerarImagemRecortada — canvas, redimensiona pro dimensoesMaximas do campo
        │  (lib/image-crop.ts)
        ▼
File pronto (PNG) — vira preview local e valor do form
```

### 1. Constantes por campo (`constants/imagem.ts` da feature)

Cada campo de imagem declara sua proporção (`aspect`) e o tamanho máximo de
saída (`dimensoesMaximas`) perto do formulário que o usa — nunca hardcoded
dentro do componente:

```ts
// features/admin/config-institucional/constants/imagem.ts
export const TAMANHO_MAXIMO_ARQUIVO_MB = 5;

export const ICONE_SISTEMA_RECORTE = {
  aspect: 1,
  dimensoesMaximas: { width: 512, height: 512 },
};

export const IMAGEM_FUNDO_LOGIN_RECORTE = {
  aspect: 16 / 9,
  dimensoesMaximas: { width: 1920, height: 1080 },
};
```

Adicionar um campo de imagem novo em qualquer outro formulário é só somar
uma constante nesse molde — o modal e a função de recorte são genéricos.

### 2. `ImageCropperModal` — a interação visual

`shared/ui/sistema/image-cropper-modal.tsx`. Recebe o `File` bruto
(`arquivo`), abre um `<dialog>` DaisyUI com o `<Cropper>` controlado (crop +
zoom) e devolve, ao confirmar, um `File` já recortado via
`onConfirmar(arquivoRecortado)`:

```tsx
<ImageCropperModal
  arquivo={arquivoParaRecortar}
  aspect={ICONE_SISTEMA_RECORTE.aspect}
  dimensoesMaximas={ICONE_SISTEMA_RECORTE.dimensoesMaximas}
  nomeArquivoSaida="icone-sistema.png"
  onConfirmar={handleRecorteConfirmado}
  onCancelar={() => setArquivoParaRecortar(null)}
/>
```

**Gotcha real (já resolvido no componente):** um modal desse tipo é aberto
de dentro de outros formulários (ex.: `IdentidadeForm` inteiro é um
`<form>`). O backdrop-click-to-close do DaisyUI usa `<form
method="dialog">`, e um `<form>` dentro de outro `<form>` é HTML inválido —
gera erro de hidratação (`<form> cannot be a descendant of <form>`). Por
isso `ImageCropperModal` renderiza via `createPortal(..., document.body)`:
o `<dialog>` sempre escapa pro fim do `<body>`, não importa de dentro de
qual formulário ele foi aberto. Qualquer modal novo que use `<form
method="dialog">` (ou qualquer `<form>` interno) e possa ser aberto de
dentro de uma tela com formulário deve seguir o mesmo padrão de portal.

### 3. `gerarImagemRecortada` — o processamento

`lib/image-crop.ts`. Puro canvas: recebe a área recortada (em pixels da
imagem original, do `onCropComplete` do react-easy-crop) e o
`dimensoesMaximas` do campo, desenha só aquela área num `<canvas>` já
escalado pra nunca passar do máximo, e devolve um `Blob` PNG:

```ts
export async function gerarImagemRecortada(
  imageSrc: string,
  areaRecorte: Area,
  dimensoesMaximas: { width: number; height: number },
): Promise<Blob> {
  const image = await criarImagem(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const escala = Math.min(1, dimensoesMaximas.width / areaRecorte.width, dimensoesMaximas.height / areaRecorte.height);
  canvas.width = Math.round(areaRecorte.width * escala);
  canvas.height = Math.round(areaRecorte.height * escala);

  ctx.drawImage(image, areaRecorte.x, areaRecorte.y, areaRecorte.width, areaRecorte.height, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar a imagem recortada."))), "image/png");
  });
}
```

`escala` só **encolhe** (o `Math.min(1, ...)` nunca deixa passar de 1) —
uma imagem pequena não é ampliada além do que já tem, só recortada na
proporção certa.

## Convenção do projeto

- Todo campo de imagem valida tamanho máximo do arquivo (`TAMANHO_MAXIMO_ARQUIVO_MB`)
  **antes** de abrir o cropper — arquivo gigante nem chega a virar preview.
- `aspect`/`dimensoesMaximas` sempre nomeados por campo (`<CAMPO>_RECORTE`),
  perto do formulário, nunca número solto dentro do componente.
- O backend nunca precisa validar dimensão de imagem — o arquivo que chega
  já nasce dentro do limite, recortado no client.
- Qualquer modal (`<dialog>` DaisyUI) que possa ser aberto de dentro de uma
  tela com `<form>` usa `createPortal` pro `document.body` — não só este.

**Exemplo real completo:**
[`features/admin/config-institucional/components/identidade-form.tsx`](../features/admin/config-institucional/components/identidade-form.tsx).
