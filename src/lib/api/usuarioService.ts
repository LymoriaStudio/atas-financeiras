import { apiDelete, apiFileUrl, apiGet, apiPost, apiPut } from "./httpClient";
import { isAuthenticated } from "../auth";

const BASE = "/api/usuarios";

export interface Usuario {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  is_active: boolean;
  role: string;
  job_title?: string;
  department?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UsuarioDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  jobTitle?: string | null;
  department?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

// Exportado pro storageService reaproveitar depois de trocar o avatar
// (a resposta do upload já vem com o usuário atualizado por inteiro).
export function fromDto(dto: UsuarioDto): Usuario {
  return {
    id: dto.id,
    full_name: dto.fullName,
    email: dto.email,
    // O backend devolve um caminho relativo (/api/usuarios/{id}/avatar) — precisa
    // da origem da API na frente pra virar uma URL que o <img src> consegue carregar.
    avatar_url: dto.avatarUrl ? apiFileUrl(dto.avatarUrl) : undefined,
    is_active: dto.isActive,
    role: dto.role,
    job_title: dto.jobTitle ?? undefined,
    department: dto.department ?? undefined,
    created_at: dto.createdAt,
    updated_at: dto.updatedAt ?? undefined,
  };
}

export async function getUsuarios() {
  const { data, error } = await apiGet<UsuarioDto[]>(BASE);
  return { data: data ? data.map(fromDto) : null, error };
}

export async function getUsuarioById(id: string) {
  const { data, error } = await apiGet<UsuarioDto>(`${BASE}/${id}`);
  return { data: data ? fromDto(data) : null, error };
}

// Busca o perfil do usuário atualmente logado
export async function getUsuarioAtual() {
  if (!isAuthenticated()) return { data: null, error: null };
  const { data, error } = await apiGet<UsuarioDto>("/api/auth/me");
  return { data: data ? fromDto(data) : null, error };
}

export async function createUsuario(
  payload: Omit<Usuario, "id" | "created_at" | "updated_at"> & { password?: string }
) {
  const { data, error } = await apiPost<UsuarioDto>(BASE, {
    fullName: payload.full_name ?? "",
    email: payload.email ?? "",
    password: payload.password ?? "",
    role: payload.role,
    jobTitle: payload.job_title,
    department: payload.department,
    isActive: payload.is_active,
  });
  return { data: data ? fromDto(data) : null, error };
}

export async function updateUsuario(id: string, payload: Partial<Omit<Usuario, "id">>) {
  const { data: atual, error: getError } = await getUsuarioById(id);
  if (getError || !atual) return { data: null, error: getError ?? new Error("Usuário não encontrado.") };

  const merged = { ...atual, ...payload };
  const { data, error } = await apiPut<UsuarioDto>(`${BASE}/${id}`, {
    fullName: merged.full_name ?? "",
    email: merged.email ?? "",
    role: merged.role,
    jobTitle: merged.job_title,
    department: merged.department,
    isActive: merged.is_active,
  });
  return { data: data ? fromDto(data) : null, error };
}

export async function deleteUsuario(id: string) {
  const { error } = await apiDelete(`${BASE}/${id}`);
  return { error };
}
