import { getAccessToken, clearStoredSession } from "@/lib/auth";
import { extrairMensagem } from "@/lib/error-utils";
import { ROUTES } from "@/lib/routes";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export type PagyInfo = { current_page: number; total_pages: number; total_count: number; per_page: number };
export type PagedResult<T> = { items: T[]; pagy: PagyInfo };

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function handleUnauthorized() {
  clearStoredSession();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith(ROUTES.login_path)) {
    window.location.replace(`${ROUTES.login_path}?expirado=1`);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    // Recursos de admin não têm modo fake — não há como simular papéis,
    // permissões e usuários de verdade sem um backend real por trás.
    throw new Error("NEXT_PUBLIC_API_URL não configurada. Recursos de admin exigem um backend real.");
  }

  const token = getAccessToken();
  if (!token) throw new AdminApiError("Sem sessão.", 401);

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (response.status === 401) {
    handleUnauthorized();
    throw new AdminApiError("Sessão expirada.", 401);
  }
  if (!response.ok) {
    throw new AdminApiError(extrairMensagem(payload, "Não foi possível concluir a operação."), response.status);
  }

  return (payload as { data: T }).data;
}

function queryString(params?: Record<string, string | number | boolean | undefined>) {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/** GET /api/v1/admin/<resource> — lista paginada (padrão `paginate` do backend). */
export function adminList<T>(
  resource: string,
  params?: { page?: number; per_page?: number } & Record<string, string | number | boolean | undefined>,
): Promise<PagedResult<T>> {
  return request<PagedResult<T>>(`/api/v1/admin/${resource}${queryString(params)}`);
}

/** GET /api/v1/admin/<resource>/:id */
export function adminGet<T>(resource: string, id: number | string): Promise<T> {
  return request<T>(`/api/v1/admin/${resource}/${id}`);
}

/** POST /api/v1/admin/<resource> */
export function adminCreate<T>(resource: string, body: Record<string, unknown>): Promise<T> {
  return request<T>(`/api/v1/admin/${resource}`, { method: "POST", body: JSON.stringify(body) });
}

/** PATCH /api/v1/admin/<resource>/:id */
export function adminUpdate<T>(resource: string, id: number | string, body: Record<string, unknown>): Promise<T> {
  return request<T>(`/api/v1/admin/${resource}/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

/** DELETE /api/v1/admin/<resource>/:id */
export async function adminDelete(resource: string, id: number | string): Promise<void> {
  await request(`/api/v1/admin/${resource}/${id}`, { method: "DELETE" });
}
