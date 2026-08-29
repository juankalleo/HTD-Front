# ESLint

**O que é:** linter de JavaScript/TypeScript — analisa o código estaticamente e aponta erros de sintaxe, más práticas e desvios de estilo antes de rodar. No Next.js vem empacotado na config `eslint-config-next`, que já entende Server/Client Components, hooks e regras do framework.

**Por que essa:** é a ferramenta de qualidade padrão do grupo — `next-locacao`, `otica` e `base-front` usam `eslint` + `eslint-config-next` pra travar regra de código no CI e no editor. Manter o mesmo linter em todo lugar significa que um erro que o lint pega num projeto é pego igual nos outros.

**Versão:** `^9` + `eslint-config-next 16.3.3` (`package.json`).

**Como rodar:**

```bash
pnpm lint
```

**Configuração real** — `eslint.config.mjs` do `base-front` herda a config do Next:

```js
import next from "eslint-config-next";

export default [
  ...next.configs["next/core-web-vitals"],
  { ignores: ["node_modules", ".next", "public"] },
];
```

**Convenção do projeto:** lint roda no `pre-commit`/CI e no editor (sublinhado vermelho em tempo real). Regra de ouro: não desligar regra com `// eslint-disable` sem justificativa no PR — o lint é a fronteira que impede código que quebra o build do App Router (ex.: `"use client"` faltando, hook fora de componente).
