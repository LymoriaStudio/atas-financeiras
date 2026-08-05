// Substitui o cliente de autenticação do Supabase (src/lib/supabase.js).
import { apiGet, apiPost, clearTokens, getAccessToken, setTokens } from "./api/httpClient";

interface AuthResult {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  usuario: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export async function login(email: string, password: string) {
  const { data, error } = await apiPost<AuthResult>("/api/auth/login", { email, password });
  if (error || !data) return { data: null, error: error ?? new Error("Falha ao entrar.") };

  setTokens(data.accessToken, data.refreshToken);
  return { data, error: null };
}

export async function logout() {
  await apiPost("/api/auth/logout");
  clearTokens();
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// Confirma que o token guardado ainda é válido, chamando um endpoint protegido leve.
export async function validateSession() {
  if (!isAuthenticated()) return false;
  const { error } = await apiGet("/api/auth/me");
  if (error) clearTokens();
  return !error;
}

export async function changePassword(novaSenha: string, senhaAtual: string) {
  return apiPost("/api/auth/change-password", { senhaAtual, novaSenha });
}
