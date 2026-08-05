// Cliente HTTP para a API própria (.NET), substituindo o cliente do Supabase.
// Mantém o mesmo formato de retorno { data, error } que os services já usavam,
// pra não precisar reescrever a forma como os componentes tratam erro.

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:5094";

const ACCESS_TOKEN_KEY = "atas_access_token";
const REFRESH_TOKEN_KEY = "atas_refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// URL "de visualização" — o servidor manda Content-Disposition: inline por padrão,
// então funciona direto num <iframe src> ou window.open pra pré-visualizar o PDF.
export function apiFileUrl(path: string): string {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// Mesma URL, mas força o navegador a baixar (Content-Disposition: attachment) —
// usar só nos botões "Baixar" explícitos, não na pré-visualização.
export function apiDownloadUrl(path: string): string {
  const url = apiFileUrl(path);
  return `${url}${url.includes("?") ? "&" : "?"}download=true`;
}

type ApiResult<T> = { data: T | null; error: Error | null };

async function parseProblem(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.detail ?? body?.title ?? `Erro ${res.status}`;
  } catch {
    return `Erro ${res.status}`;
  }
}

// Evita disparar N refreshes em paralelo quando várias chamadas tomam 401 ao mesmo tempo.
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        clearTokens();
        return false;
      }
      const json = await res.json();
      setTokens(json.accessToken, json.refreshToken);
      return true;
    } catch {
      return false;
    }
  })();

  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  isFormData?: boolean;
  skipAuthRetry?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { method = "GET", body, isFormData = false, skipAuthRetry = false } = options;

  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });

    if (res.status === 401 && !skipAuthRetry && token) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return request<T>(path, { ...options, skipAuthRetry: true });
      }
    }

    if (!res.ok) {
      return { data: null, error: new Error(await parseProblem(res)) };
    }

    if (res.status === 204) {
      return { data: null, error: null };
    }

    const data = (await res.json()) as T;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error("Falha de conexão com a API.") };
  }
}

export const apiGet = <T>(path: string) => request<T>(path);
export const apiPost = <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body });
export const apiPut = <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body });
export const apiDelete = <T = void>(path: string) => request<T>(path, { method: "DELETE" });
export const apiUpload = <T>(path: string, formData: FormData) =>
  request<T>(path, { method: "POST", body: formData, isFormData: true });
