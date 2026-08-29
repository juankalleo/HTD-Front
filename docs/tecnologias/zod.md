# Zod

**O que é:** biblioteca de validação e declaração de schema em TypeScript — você descreve o formato dos dados num objeto (`z.object`), e o Zod valida qualquer valor contra esse formato e ainda gera o tipo TypeScript correspondente (`z.infer`).

**Por que essa:** é a lib de schema de todo o grupo — `next-locacao`, `otica` e `base-front` validam formulário e payloads de API com Zod. O ponto forte é que o schema é a única fonte da verdade: o tipo sai dele, então schema e tipo nunca ficam dessincronizados. Também é a "cola" do React Hook Form (ver [React Hook Form + Zod](/padrao-frontend/tecnologias/react-hook-form-zod)).

**Versão:** `^4.4.3` (`package.json`).

**Como importar:**

```bash
pnpm add zod
```

```ts
import { z } from "zod";
```

**Exemplo real** — schema de login (`features/autenticacao/login/schemas/login.schema.ts`):

```ts
import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
```

**Validação cruzada** — confirmação de senha usa `.refine()` no schema, não validação manual no componente:

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

**Onde usar no projeto:** todo `schemas/` dentro de uma feature (login, usuários, configurações) define seus tipos via `z.infer`; o resolver do formulário e a checagem de payload de `services/` passam pelo mesmo schema. Convenção: campos de senha em inglês (`password`, `passwordConfirmation`) pro autocomplete do HTML bater.
