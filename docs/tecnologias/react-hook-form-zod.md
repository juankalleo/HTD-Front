# React Hook Form + Zod

**O que é:** dupla pra formulário — React Hook Form controla os campos
(sem re-render a cada tecla), Zod valida o formato dos dados; o
`@hookform/resolvers` é a cola entre os dois.

**Por que essa:** mesma dupla usada no `next-locacao` e na `otica` — os
dois projetos de referência resolvem formulário exatamente assim. Zod
também descreve o formato dos dados de um jeito que já gera o tipo
TypeScript junto (`z.infer`), então schema e tipo nunca ficam
dessincronizados.

**Versão:** `react-hook-form ^7.86.0`, `zod ^4.4.3`,
`@hookform/resolvers ^5.9.1` (`package.json`).

**Como importar:**

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

```ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
```

**Exemplo real** — schema (`features/autenticacao/login/schemas/login.schema.ts`):

```ts
import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
```

Uso no hook (`features/autenticacao/login/hooks/use-login-form.ts`):

```ts
const form = useForm<LoginFormValues>({
  resolver: zodResolver(loginFormSchema),
  defaultValues: { email: "", password: "" },
});
```

Uso no componente (`shared/forms/form-field.tsx` recebe o registro direto):

```tsx
<FormField
  label="E-mail"
  id="email"
  type="email"
  error={errors.email?.message}
  {...register("email")}
/>
```

**Convenção do projeto:** campo de senha sempre em inglês (`password`,
`passwordConfirmation`), mesmo com todo o resto em português — é o nome que
HTML/autocomplete esperam (`type="password"`,
`autoComplete="current-password"`/`"new-password"`), e é assim que os dois
projetos de referência também nomeiam. Confirmação de senha usa
`.refine()` no schema pra comparar os dois campos, não validação manual no
componente:

```ts
export const alterarSenhaSchema = z
  .object({
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    passwordConfirmation: z.string().min(6, "Mínimo de 6 caracteres"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não conferem",
    path: ["passwordConfirmation"],
  });
```
