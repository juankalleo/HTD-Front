import { ROUTES } from "@/lib/routes";

/** Rota pra onde o usuário vai depois de um login bem-sucedido. */
export const AUTH_POST_LOGIN_PATH = ROUTES.dashboard_path;

/**
 * Credencial do modo fake (sem backend real — ver `services/api-identity.ts`
 * e `AUTH_FAKE_TOKEN` abaixo). Só ativa fora de produção.
 */
export const AUTH_DEMO_EMAIL = "demo@empresa.com.br";
export const AUTH_DEMO_PASSWORD = "demo123";
export const AUTH_FAKE_TOKEN = "fake-session-token";
