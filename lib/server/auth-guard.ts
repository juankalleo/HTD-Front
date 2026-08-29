import { NextResponse } from "next/server";
import { AUTH_FAKE_TOKEN } from "@/features/autenticacao/login/constants";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

/**
 * Guarda de sessão pros Route Handlers em `app/api/*` (hoje só
 * `relatorios/pdf` — ver `docs/SEGURANCA-EXPORTACAO.md`). Sem isso, qualquer um
 * que alcance o servidor Next.js conseguiria gerar PDF sem estar logado —
 * Puppeteer é caro (CPU/memória/tempo por request), um alvo óbvio de abuso
 * se ficar aberto.
 *
 * Verifica contra a api/ de verdade (`GET /auth/me`), a mesma fonte de
 * verdade que `fetchCurrentUser` usa — nunca decide "válido" só pela
 * presença do header Authorization. Em modo fake (sem
 * `NEXT_PUBLIC_API_URL`, ver `services/api-identity.ts`), aceita o mesmo
 * `AUTH_FAKE_TOKEN` que o resto do app aceita nesse modo — mesmo nível de
 * confiança do resto do app, não mais nem menos.
 *
 * Uso: `const bloqueado = await exigirSessaoValida(request); if (bloqueado) return bloqueado;`
 */
export async function exigirSessaoValida(request: Request): Promise<NextResponse | null> {
  const cabecalho = request.headers.get("authorization");
  const token = cabecalho?.startsWith("Bearer ") ? cabecalho.slice("Bearer ".length) : null;

  if (!token) {
    return NextResponse.json({ status: "error", message: "Sem sessão.", errors: null }, { status: 401 });
  }

  if (!BASE_URL) {
    if (token !== AUTH_FAKE_TOKEN) {
      return NextResponse.json({ status: "error", message: "Sessão inválida.", errors: null }, { status: 401 });
    }
    return null;
  }

  const resposta = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);

  if (!resposta?.ok) {
    return NextResponse.json({ status: "error", message: "Sessão inválida ou expirada.", errors: null }, { status: 401 });
  }

  return null;
}
