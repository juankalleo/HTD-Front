# SweetAlert2

**O que é:** biblioteca de alertas/toasts. Aqui é usada só no modo toast
(canto da tela, sem bloquear a interação) pra feedback de sucesso/erro
depois de um submit.

**Por que essa:** mesma lib da `otica` — feedback de formulário lá é sempre
via toast, nunca banner fixo dentro do formulário. Trocado no projeto: os
quatro formulários de autenticação usavam banner inline até essa decisão;
todos foram convertidos pra toast + `form.setError()` no campo relevante
quando faz sentido (login marca "senha" como inválido sem repetir a
mensagem, que já foi pro toast).

**Versão:** `^11.26.25` (`package.json`).

**Como importar:**

```bash
pnpm add sweetalert2
```

Não se importa `sweetalert2` direto nos componentes — sempre pelo wrapper
do projeto, que já fixa posição/estilo/duração padrão:

```ts
import { Toast } from "@/shared/ui";
```

**Exemplo real** — o wrapper (`shared/ui/sistema/toast.tsx`):

```tsx
export const Toast = {
  success: (input: ToastInput) => Toast.fire({ ...normalize(input), icon: "success" }),
  error: (input: ToastInput) => Toast.fire({ ...normalize(input), icon: "error" }),
  warning: (input: ToastInput) => Toast.fire({ ...normalize(input), icon: "warning" }),
  info: (input: ToastInput) => Toast.fire({ ...normalize(input), icon: "info" }),
};
```

Uso real (`features/autenticacao/login/hooks/use-login-form.ts`):

```ts
if (!resultado.ok) {
  void Toast.error({ title: "Não foi possível entrar", description: resultado.message });
  form.setError("password", { message: " " });
  return;
}

void Toast.success({ title: "Sessão iniciada", description: nome ? `Bem-vindo, ${nome}` : undefined });
```

`void` na frente porque `Toast.success`/`.error` devolvem uma Promise do
SweetAlert2 que ninguém precisa aguardar (o toast já fecha sozinho).
