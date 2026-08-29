# Formulários

> Documentação viva da Fase 3 do [`ROADMAP.md`](ROADMAP.md), com a mudança
> de padrão (modal → rota própria) decidida depois. Ver
> [`tecnologias/react-hook-form-zod.md`](tecnologias/react-hook-form-zod.md)
> pra saber por que essas libs.

## A cadeia padrão

```
schemas/<algo>.schema.ts (Zod)
   │
   ▼
useForm({ resolver: zodResolver(schema) })      ← no componente de formulário
   │  form.handleSubmit
   ▼
useMutation (useCreateX / useUpdateX)           ← features/.../hooks/
   │  sucesso → toast + invalidate query        │  erro → toast
   ▼                                             ▼
router.push(rota de volta)              shared/ui/sistema/toast.tsx (SweetAlert2)
```

Regra fixa: **schema Zod nunca inventa validação mais forte que o backend
Rails**. Se o model só exige `presence: true`, o schema é `z.string().min(1,
"...")`, nunca `.min(2)`/regex "pra garantir". Achado real durante o
desenvolvimento: `usuarioFormSchema.nome` tinha `min(2)` inventado —
removido depois de conferir que `User` só valida presence. Regra de ouro:
antes de escrever uma validação, ler o model real em `api/app/models/`.

## `shared/forms/form-field.tsx`

Campo de texto padrão — label + input + mensagem de erro, cor do erro vindo
do token DaisyUI (`input-error`), nunca cor fixa:

```tsx
export function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-base-content" htmlFor={id}>{label}</label>
      <input id={id} className={`input w-full ${error ? "input-error" : ""}`} {...inputProps} />
      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  );
}
```

Uso com `register` do React Hook Form:

```tsx
<FormField label="Nome" id="nome" error={errors.nome?.message} {...register("nome")} />
```

`<select>` **não** usa `FormField` (que é só pra `<input>`) — cada
formulário com select monta o mesmo trio label/select/erro na mão (ver
`usuario-form.tsx`, `aparencia-form.tsx`). Não existe hoje um `SelectField`
compartilhado — é candidato natural se aparecer um terceiro select com o
mesmo shape.

## Todo campo de texto: `placeholder` real + `maxLength`

**Achado real (27/08/2026):** vários campos (`nome`/`email` de usuário,
`descricao` de tipo de usuário/papel, `nome_sistema`) não tinham
`placeholder` nenhum, e nenhum campo de texto do projeto (fora
`referenciais/`, que já nasceu certo) tinha `maxLength` — nada impedia
colar um texto enorme num campo como `nome`. `FormField` já aceitava os
dois de graça (`InputHTMLAttributes<HTMLInputElement>` no spread, ver
seção acima) — o gap nunca foi no componente, era todo call site
esquecendo de passar.

`placeholder` é sempre um **exemplo real e plausível** do que vai naquele
campo (`"Maria da Silva"`, `"maria.silva@empresa.com.br"`,
`"Administrador"`), nunca o nome do campo repetido (`"Digite o nome"` não
ensina nada que o `label` já não disse).

`maxLength` vem de `lib/form-limits.ts` — **nunca um número solto**
escrito de novo em cada arquivo:

```ts
// lib/form-limits.ts — espelha ApplicationRecord::MAX_STRING_LENGTH/
// MAX_TEXT_LENGTH (api/app/models/application_record.rb), validação real,
// sempre ativa em toda coluna :string/:text de todo model
export const MAX_STRING_LENGTH = 255;
export const MAX_TEXT_LENGTH = 10_000;
export const MAX_PASSWORD_LENGTH = 128; // ver nota sobre senha abaixo
```

Aplica nos dois lugares — `maxLength` do `<input>` (trava visual/paste,
testado ao vivo: colar 400 caracteres em `nome` resulta em exatamente 255
no campo) **e** `.max()` do Zod (mensagem de erro clara, cobre qualquer
jeito de o valor chegar maior que o input sozinho impediria):

```ts
// schema
nome: z.string().min(1, "Informe o nome").max(MAX_STRING_LENGTH, `Máximo de ${MAX_STRING_LENGTH} caracteres`),
```

```tsx
// form
<FormField label="Nome" id="nome" placeholder="Maria da Silva" maxLength={MAX_STRING_LENGTH} error={errors.nome?.message} {...register("nome")} />
```

**Nota sobre senha:** `password` não é coluna real da tabela (atributo
virtual do Devise) — não passa pelo teto genérico do `ApplicationRecord`.
`MAX_PASSWORD_LENGTH = 128` espelha `Devise.password_length`
(`config.password_length = 6..128` em `api/config/initializers/
devise.rb`), validado de verdade em `User` (`validates :password, length:
{ within: Devise.password_length }` — sem trazer o módulo `:validatable`
inteiro do Devise, que validaria e-mail junto sem necessidade).

**Exceção legítima, não bug:** `referenciais/config.ts` usa limites
menores que 255 pra `sigla` (12) e `uf` (2) — não é regra inventada tipo
o `.min(2)` da seção anterior, é fato estrutural do dado (sigla de UF
brasileira é sempre 2 letras), não uma regra de negócio adivinhada. Regra
de ouro continua: só encurtar abaixo do teto genérico quando o formato do
dado em si já garante isso, nunca "pra parecer mais rigoroso".

## `<select>` numérico: sempre string no schema

Um `<select>` HTML só devolve `string`, nunca `number`. Convenção do
projeto: o campo no schema Zod fica `z.string().min(1, "Selecione...")`, e a
conversão pra `number` acontece só no ponto de uso (`Number(valores.campo)`
ao montar o body da mutation) — nunca `z.coerce.number()` no próprio schema.

Motivo técnico, não só estilo: `z.coerce.number()` faz o **tipo de input**
do resolver (`z.input<typeof schema>`) divergir do **tipo de output**
(`unknown` vs `number`), e `useForm<T>()` exige que os dois batam — dá erro
de TypeScript real (`escala.schema.ts` bateu nisso, resolvido trocando o
`z.coerce.number()` por `z.string()` + conversão no submit).

```ts
// ❌ dá erro de tipo em useForm<T>()
escala: z.coerce.number(),

// ✅ padrão do projeto
escala: z.string().min(1, "Selecione uma escala"),
```

## Novo / Editar: rota própria, não modal

Duas telas por recurso (`tipos-usuario`, `usuarios`, `papéis` hoje) em vez
de modal — decisão explícita, revertendo o padrão anterior (todo CRUD abria
`<dialog>`). Convenção de rota:

```
/<recurso>                    → lista
/<recurso>/novo                → formulário de criação
/<recurso>/[id]/editar          → formulário de edição
```

O componente de formulário (`<Recurso>Form`) é o **mesmo** nos dois casos —
recebe o registro como prop opcional:

```tsx
export function PapelForm({ papel, onDone }: { papel?: APapel; onDone: () => void }) {
  const { createPapel } = useCreatePapel();
  const { updatePapel } = useUpdatePapel();
  // ...
  const onSubmit = form.handleSubmit(async (valores) => {
    if (papel) await updatePapel(papel.id, valores);
    else await createPapel(valores);
    onDone();
  });
}
```

A página `novo/page.tsx` renderiza sem `papel`; `[id]/editar/page.tsx` busca
o registro (`useAdminGet`, ver [`DADOS-E-API.md`](DADOS-E-API.md)) e passa
adiante — mostrando "Carregando..." enquanto isso, nunca um formulário com
campo vazio piscando antes do fetch chegar. `onDone` faz `router.push()` de
volta pra lista — não fecha um `<dialog>` (não existe mais).

**Nem todo recurso precisa disso** — é decisão por tela, não regra
universal. Um recurso com 1-2 campos simples ainda pode fazer sentido em
modal; a régua é "o formulário justifica uma rota própria" (ex.: upload de
imagem, muitos campos, preview visual).

## Upload de arquivo: fora do React Hook Form

Campo de imagem (ver `identidade-form.tsx`, ícone do sistema + fundo do
login) não usa `register`/Zod — é `useState<File | null>` isolado, com
preview via `URL.createObjectURL`. Motivo: RHF + `<input type="file">` exige
lidar com `FileList` e tipagem de schema mais complexa pra um ganho pequeno,
já que o arquivo não precisa de validação declarativa (só "é imagem", já
garantido por `accept="image/*"`).

```tsx
const [icone, setIcone] = useState<File | null>(null);
// ...
<input type="file" accept="image/*" onChange={(e) => setIcone(e.target.files?.[0] ?? null)} />
```

No submit, o arquivo (se trocado) entra num `FormData` junto dos campos de
texto — nunca `JSON.stringify` quando há upload (ver
[`DADOS-E-API.md`](DADOS-E-API.md#services--só-fetch-zero-react)):

```ts
const formData = new FormData();
formData.append("c_configuracao[nome_sistema]", valores.nome_sistema);
if (icone) formData.append("c_configuracao[icone_sistema]", icone);
await mutateAsync({ id: config.id, formData });
```

## Feedback: toast + `form.setError` quando faz sentido

Toda mutation de sucesso/erro já dispara toast sozinha (vem de
`useAdminCreate`/`Update`, ver [`DADOS-E-API.md`](DADOS-E-API.md)) — o
formulário não chama `Toast.success`/`Toast.error` na mão. Quando o erro é
de um campo específico e óbvio pro usuário (ex.: senha errada no login), o
componente **também** marca o campo com `form.setError(...)`, sem repetir a
mensagem (que já foi pro toast):

```ts
form.setError("password", { message: " " }); // mensagem em branco de propósito — já foi pro toast
```
