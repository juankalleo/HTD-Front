import { NextResponse, type NextRequest } from "next/server";

/**
 * Content-Security-Policy por requisição — precisa de proxy (não dá pra
 * ficar só em `next.config.ts`) porque `script-src` depende de um nonce
 * novo a cada request, liberando só o script inline real do projeto (o de
 * tema, em `app/layout.tsx`) e os chunks que o próprio Next.js injeta —
 * nunca script de terceiro, porque não existe nenhum no projeto. `x-nonce`
 * é repassado como header de requisição pra Server Components lerem via
 * `headers()` e aplicarem no `<script nonce={...}>`. Ver
 * docs/SEGURANCA-FRONTEND.md.
 *
 * Arquivo `proxy.ts` (não mais `middleware.ts`) — convenção renomeada no
 * Next.js 16, `middleware.ts` gera warning de depreciação no build.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Único host externo que a página realmente precisa contatar: a API
  // Rails configurada (fetch direto do browser, sem proxy — ver
  // docs/CONCEITOS-FRONTEND.md#13-bff-backend-for-frontend). Em modo fake
  // (sem NEXT_PUBLIC_API_URL) fica vazio — nada externo é chamado mesmo.
  const apiOrigin = (() => {
    try {
      return process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : "";
    } catch {
      return "";
    }
  })();

  const csp = [
    "default-src 'self'",
    // 'strict-dynamic' cobre os chunks carregados via next/dynamic (ver
    // docs/CONCEITOS-FRONTEND.md#5-code-splitting) sem precisar listar
    // cada um; 'unsafe-eval' só em dev, porque o Fast Refresh do Next usa
    // eval — build de produção não precisa disso.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    // Tema/aparência institucional (docs/APARENCIA-AVANCADA.md) depende de
    // muito style inline via prop `style` do React — 'unsafe-inline' aqui
    // é exceção consciente, não descuido (risco de style-based attack é
    // bem menor que script-based).
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data:${apiOrigin ? ` ${apiOrigin}` : ""}`,
    "font-src 'self'",
    `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Roda em toda página; pula asset estático/imagem já otimizada (não
    // servem HTML, não precisam de CSP).
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
