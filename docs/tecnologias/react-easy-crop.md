# react-easy-crop

**O que é:** biblioteca headless de recorte/posicionamento de imagem — um
`<Cropper>` controlado que recebe `crop`/`zoom`/`aspect` e devolve, via
callback, a área (em pixels da imagem original) que o usuário arrastou/deu
zoom pra enquadrar. Não desenha canvas nem gera arquivo nenhum sozinha —
isso fica por conta de quem consome.

**Por que essa:** os campos de imagem da Identidade institucional (ícone do
sistema, fundo do login) já têm proporção e tamanho máximo fixados em código
(`ICONE_SISTEMA_RECORTE`, `IMAGEM_FUNDO_LOGIN_RECORTE` — ver
[`../UPLOAD-DE-IMAGEM.md`](../UPLOAD-DE-IMAGEM.md)), então o admin precisa
poder **posicionar** a imagem antes de enviar, não só escolher um arquivo e
torcer. Alternativas de mercado como `react-avatar-editor` e `cropperjs`
vêm com estilo/DOM próprio difícil de encaixar sem conflitar com o tema
DaisyUI; `react-image-crop` é parecida mas exige montar o canvas de recorte
na mão de um jeito mais verboso. `react-easy-crop` é puramente headless (só
`transform`/`overflow` via CSS, sem folha de estilo própria), o corpo do
crop em si (canvas, redimensionamento pro tamanho máximo) já é
responsabilidade nossa em `lib/image-crop.ts` de qualquer forma — então não
duplica trabalho nem traz um segundo design system pra dentro do modal
DaisyUI.

**Versão:** `^6.2.3` (`package.json`).

**Como importar:**

```bash
pnpm add react-easy-crop
```

```tsx
import Cropper, { type Area } from "react-easy-crop";
```

**Exemplo real** — `shared/ui/sistema/image-cropper-modal.tsx`, dentro de um
modal DaisyUI (`<dialog className="modal">`):

```tsx
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [areaRecortePixels, setAreaRecortePixels] = useState<Area | null>(null);

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
```

**Convenção do projeto:** o `<Cropper>` só entrega a **área** recortada (em
pixels); quem desenha o canvas final, redimensiona pro `dimensoesMaximas` do
campo e devolve um `File` pronto pra enviar é `lib/image-crop.ts`
(`gerarImagemRecortada`) — biblioteca fica restrita à interação visual,
nunca ao processamento do arquivo. Detalhe completo do padrão em
[`../UPLOAD-DE-IMAGEM.md`](../UPLOAD-DE-IMAGEM.md).
