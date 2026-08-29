import { AUTH_DEMO_EMAIL, AUTH_DEMO_PASSWORD, AUTH_FAKE_TOKEN } from "@/features/autenticacao/login/constants";
import { clearStoredSession, getAccessToken, getStoredUser, storeAccessToken, storeUser } from "@/lib/auth";
import { extrairMensagem } from "@/lib/error-utils";
import { ROUTES } from "@/lib/routes";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export type SessionUser = { id?: number; nome: string; email: string; a_tenant?: { id: number; nome: string } | null };

const FAKE_USER: SessionUser = { nome: "Usuário Demo", email: AUTH_DEMO_EMAIL };

export type ApiResult = { ok: true } | { ok: false; status: number; message: string };

/**
 * Modo fake: só quando `NEXT_PUBLIC_API_URL` não está setada, pra o fluxo de
 * login → sessão → área protegida → logout funcionar de ponta a ponta sem
 * nenhum backend real. Nunca em produção — a credencial demo fica
 * documentada na wiki, não pode ficar ativa se o deploy esquecer a env var.
 */
function modoFakeDisponivel() {
  return process.env.NODE_ENV !== "production";
}

async function lerJsonSeguro(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function handleUnauthorized() {
  clearStoredSession();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith(ROUTES.login_path)) {
    window.location.replace(`${ROUTES.login_path}?expirado=1`);
  }
}

/**
 * POST /api/v1/auth/sign_in — Devise + devise-jwt (padrão do repo `api/`
 * deste monorepo). Corpo `{ user: { email, password } }`; token devolvido no
 * header `Authorization: Bearer <token>` da resposta, não no body — o body
 * só tem o envelope `{status, message, data}`.
 *
 * Chamada direta do browser pro Rails (sem proxy Next.js, ao contrário de
 * outros padrões que já vimos) — exige CORS habilitado no Rails
 * (`config/initializers/cors.rb`, hoje comentado no template) com
 * `expose_headers: ["Authorization"]`, senão o fetch não consegue ler esse
 * header de volta numa resposta cross-origin.
 */
export async function signIn(email: string, password: string): Promise<ApiResult> {
  if (!BASE_URL) {
    if (!modoFakeDisponivel()) {
      throw new Error("NEXT_PUBLIC_API_URL não configurada em produção. Modo fake é só para desenvolvimento.");
    }
    if (email.trim().toLowerCase() !== AUTH_DEMO_EMAIL || password !== AUTH_DEMO_PASSWORD) {
      return { ok: false, status: 401, message: "E-mail ou senha inválidos." };
    }
    storeAccessToken(AUTH_FAKE_TOKEN);
    storeUser(FAKE_USER);
    return { ok: true };
  }

  const response = await fetch(`${BASE_URL}/api/v1/auth/sign_in`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ user: { email: email.trim(), password } }),
  });

  const payload = await lerJsonSeguro(response);
  if (!response.ok) {
    return { ok: false, status: response.status, message: extrairMensagem(payload, "Não foi possível entrar.") };
  }

  const token = response.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return { ok: false, status: 502, message: "Backend não devolveu token de sessão." };
  }

  storeAccessToken(token);
  // Corpo do sign_in já vem com os dados do usuário (CurrentUserSerializer) —
  // guarda pra exibição instantânea, sem esperar a query de sessão.
  const user = (payload as { data?: SessionUser } | null)?.data;
  if (user) storeUser(user);

  return { ok: true };
}

/** DELETE /api/v1/auth/sign_out — best-effort: falha do backend não trava o logout local. */
export async function signOut(): Promise<void> {
  const token = getAccessToken();
  if (BASE_URL && token && token !== AUTH_FAKE_TOKEN) {
    await fetch(`${BASE_URL}/api/v1/auth/sign_out`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }
  clearStoredSession();
}

/** GET /api/v1/auth/me — `data` é o `CurrentUserSerializer` (id, nome, email, a_tipo_usuario). */
export async function fetchCurrentUser(): Promise<SessionUser> {
  const token = getAccessToken();
  if (!token) throw new Error("Sem sessão");

  if (!BASE_URL) {
    if (token !== AUTH_FAKE_TOKEN) throw new Error("Sessão inválida");
    return FAKE_USER;
  }

  const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Sessão expirada");
  }
  if (!response.ok) throw new Error("Não foi possível carregar a sessão.");

  const payload = (await response.json()) as { data: SessionUser };
  return payload.data;
}

export type UpdateProfileResult = { ok: true; user: SessionUser } | { ok: false; status: number; message: string };

/**
 * PATCH /api/v1/auth/me — autoatendimento: cada usuário só edita o próprio
 * `nome`/`email` (nunca papel/status, geridos só pelo admin — regra do
 * `MeController#me_params` no backend `api/`). Resposta: envelope com o
 * `CurrentUserSerializer` atualizado.
 */
export async function updateProfile(nome: string, email: string): Promise<UpdateProfileResult> {
  const token = getAccessToken();
  if (!token) return { ok: false, status: 401, message: "Sem sessão." };

  if (!BASE_URL) {
    const atual = getStoredUser<SessionUser>() ?? FAKE_USER;
    const atualizado: SessionUser = { ...atual, nome, email };
    storeUser(atualizado);
    return { ok: true, user: atualizado };
  }

  const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ user: { nome, email } }),
  });

  const payload = await lerJsonSeguro(response);
  if (response.status === 401) {
    handleUnauthorized();
    return { ok: false, status: 401, message: "Sessão expirada." };
  }
  if (!response.ok) {
    return { ok: false, status: response.status, message: extrairMensagem(payload, "Não foi possível salvar o perfil.") };
  }

  const user = (payload as { data: SessionUser }).data;
  storeUser(user);
  return { ok: true, user };
}

/**
 * NÃO IMPLEMENTADO. O backend `api/` deste monorepo desativa o módulo
 * `:passwords` do Devise (`skip: [..., :passwords, ...]` em
 * `config/routes.rb`) — não existe endpoint de recuperação de senha hoje.
 * Formulário e validação já funcionam; só o envio real fica pendente de um
 * endpoint no backend. Quando existir, troca o corpo desta função por algo
 * como:
 *
 * const response = await fetch(`${BASE_URL}/api/v1/auth/password`, {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ user: { email } }),
 * });
 */
export async function requestPasswordReset(_email: string): Promise<ApiResult> {
  void _email;
  return { ok: false, status: 501, message: "Recuperação de senha ainda não está disponível — backend não expõe esse endpoint." };
}

/**
 * NÃO IMPLEMENTADO — mesma razão de `requestPasswordReset`. Endpoint
 * esperado (quando existir), algo como:
 *
 * const response = await fetch(`${BASE_URL}/api/v1/auth/password`, {
 *   method: "PATCH",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ user: { reset_password_token: token, password } }),
 * });
 */
export async function resetPassword(_token: string, _password: string): Promise<ApiResult> {
  void _token;
  void _password;
  return { ok: false, status: 501, message: "Redefinição de senha ainda não está disponível — backend não expõe esse endpoint." };
}

/**
 * NÃO IMPLEMENTADO. O `User` do backend `api/` não tem nenhuma flag de
 * "primeiro acesso" hoje (isso é fluxo custom de produto, não faz parte do
 * chassi) — não há como um token de primeiro acesso ser emitido ou validado
 * ainda. Formulário e validação já funcionam; falta o endpoint real.
 */
export async function completeFirstAccess(_token: string, _password: string): Promise<ApiResult> {
  void _token;
  void _password;
  return { ok: false, status: 501, message: "Primeiro acesso ainda não está disponível — backend não expõe esse fluxo." };
}
