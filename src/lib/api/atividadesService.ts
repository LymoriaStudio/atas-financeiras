import { apiGet, apiPost } from "./httpClient";

const BASE = "/api/atividades";

export interface Atividade {
  id: string;
  usuario_id: string | null;
  acao: string;
  documento: string | null;
  criado_em: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

interface AtividadeDto {
  id: string;
  acao: string;
  documento?: string | null;
  createdAt: string;
  usuarioNome?: string | null;
  usuarioAvatarUrl?: string | null;
  viewed: boolean;
}

function fromDto(dto: AtividadeDto): Atividade {
  return {
    id: dto.id,
    usuario_id: null, // não exposto pelo DTO; nada no front depende do id em si, só do nome/avatar
    acao: dto.acao,
    documento: dto.documento ?? null,
    criado_em: dto.createdAt,
    profiles: dto.usuarioNome ? { full_name: dto.usuarioNome, avatar_url: dto.usuarioAvatarUrl ?? null } : null,
  };
}

// Registra uma ação no log de atividades (best-effort, não bloqueia o fluxo principal).
// Público de propósito: visitante anônimo do site também loga ações (ex: download).
export async function logAtividade(acao: string, documento?: string) {
  const { error } = await apiPost(BASE, { acao, documento: documento ?? null });
  return { error };
}

// GET — últimas atividades, com nome/avatar de quem realizou a ação
export async function getAtividadesRecentes(limit = 6) {
  const { data, error } = await apiGet<AtividadeDto[]>(`${BASE}?limit=${limit}`);
  return { data: data ? data.map(fromDto) : null, error };
}

// GET — ids das atividades já marcadas como visualizadas pelo usuário logado
export async function getNotificacoesVisualizadas() {
  const { data, error } = await apiGet<AtividadeDto[]>(`${BASE}?limit=50`);
  if (error) return { data: null, error };
  return { data: new Set((data ?? []).filter((a) => a.viewed).map((a) => a.id)), error: null };
}

// Marca (ou desmarca) uma atividade como visualizada pelo usuário logado
export async function toggleNotificacaoVisualizada(atividadeId: string, viewed: boolean) {
  const { error } = await apiPost(`${BASE}/${atividadeId}/visualizada?viewed=${viewed}`);
  return { error };
}
