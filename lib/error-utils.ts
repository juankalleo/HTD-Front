export type ApiErrorDetail = { field: string; message: string };

export type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string | string[] | undefined>;
  error?: {
    code?: string;
    message?: string;
    details?: string | ApiErrorDetail[];
  };
};

function errorBody(input: unknown): ApiErrorBody | null {
  if (!input || typeof input !== "object") return null;

  const responseData = (input as { response?: { data?: unknown } }).response?.data;
  if (responseData && typeof responseData === "object") return responseData as ApiErrorBody;

  if (input instanceof Error) return null;
  if ("isAxiosError" in input) return null;

  return input as ApiErrorBody;
}

function firstValidationError(errors: ApiErrorBody["errors"]) {
  if (!errors) return undefined;

  for (const value of Object.values(errors)) {
    if (Array.isArray(value)) {
      const message = value.find((item) => item.trim());
      if (message) return message;
    }
    if (typeof value === "string" && value.trim()) return value;
  }
}

/**
 * Extrai mensagem amigável de erros vindos do Rails, de hooks/mutations ou de
 * clientes HTTP. Mantém o nome antigo (`extrairMensagem`) para os services que
 * já chamavam esta função, mas cobre shapes mais completos:
 * `message`, `errors`, `error.message`, `error.details` e falha de rede.
 */
export function extrairMensagem(input: unknown, fallback: string): string {
  const body = errorBody(input);

  if (typeof body?.message === "string" && body.message.trim()) return body.message;

  const validationError = firstValidationError(body?.errors);
  if (validationError) return validationError;

  const nestedError = body?.error;
  if (nestedError) {
    if (Array.isArray(nestedError.details) && nestedError.details.length > 0) {
      const first = nestedError.details[0];
      return `${first.field}: ${first.message}`;
    }
    if (typeof nestedError.message === "string" && nestedError.message.trim()) return nestedError.message;
    if (typeof nestedError.details === "string" && nestedError.details.trim()) return nestedError.details;
  }

  const maybeHttpError = input as { isAxiosError?: boolean; response?: unknown; message?: unknown };
  if (maybeHttpError.isAxiosError) {
    return maybeHttpError.response
      ? fallback
      : "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  }

  const nativeMessage = maybeHttpError.message;
  if (typeof nativeMessage === "string" && nativeMessage.trim() && !nativeMessage.startsWith("Request failed")) {
    return nativeMessage;
  }

  return fallback;
}

export function extrairErroDeCampo(input: unknown, field: string): string | undefined {
  const body = errorBody(input);
  const fieldError = body?.errors?.[field];

  if (Array.isArray(fieldError)) return fieldError.find((message) => message.trim());
  if (typeof fieldError === "string" && fieldError.trim()) return fieldError;

  const details = body?.error?.details;
  if (Array.isArray(details)) return details.find((detail) => detail.field === field)?.message;
}
