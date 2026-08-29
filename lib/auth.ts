const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccessToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function storeAccessToken(token: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/**
 * Cache local do usuário logado — só pra exibir algo instantâneo (nome no
 * header, por exemplo) sem esperar a query de sessão resolver. A fonte da
 * verdade continua sendo a query (`useSession`); isto aqui nunca deve ser
 * lido como garantia de sessão válida.
 */
export function getStoredUser<T = unknown>(): T | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storeUser(user: unknown) {
  if (!isBrowser()) return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
