import { apiDelete, apiDownloadUrl, apiFileUrl, apiGet, apiPost, apiPut } from "./httpClient";

const BASE = "/api/atas";

// pageSize bem alto pra manter o contrato antigo (o front sempre buscou a lista
// inteira e filtrava/paginava no client) sem precisar reescrever todo mundo que
// consome getAtas() pra paginação de verdade no servidor.
const FETCH_ALL_PAGE_SIZE = 1000;

export interface Ata {
  id: string;
  numero: string;
  titulo: string;
  tipo?: string;
  categoria_id: string[];
  descricao: string;
  data: string;
  horario: string;
  local: string;
  presidente: string;
  secretario: string;
  participantes: string[];
  arquivos: { nome: string; url: string; downloadUrl?: string; tamanho?: number }[];
  status: string;
  criado_em?: string;
  atualizado_em?: string;
  downloads_count?: number;
  deleted_at?: string | null;
}

interface AtaArquivoDto {
  id: string;
  nome: string;
  contentType: string;
  tamanhoBytes: number;
  createdAt: string;
  downloadUrl: string;
}

interface AtaDto {
  id: string;
  numero: string;
  titulo: string;
  tipo?: string | null;
  descricao?: string | null;
  data: string;
  horario?: string | null;
  local?: string | null;
  presidente: string;
  secretario?: string | null;
  participantes?: string | null;
  status: string;
  downloadsCount: number;
  deletedAt?: string | null;
  categoriaId: string;
  categoriaNome: string;
  arquivos: AtaArquivoDto[];
  createdAt: string;
  updatedAt?: string | null;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

function fromDto(dto: AtaDto): Ata {
  return {
    id: dto.id,
    numero: dto.numero,
    titulo: dto.titulo,
    tipo: dto.tipo ?? undefined,
    categoria_id: dto.categoriaId ? [dto.categoriaId] : [],
    descricao: dto.descricao ?? "",
    data: dto.data,
    horario: dto.horario ?? "",
    local: dto.local ?? "",
    presidente: dto.presidente,
    secretario: dto.secretario ?? "",
    participantes: dto.participantes ? dto.participantes.split(",").map((s) => s.trim()).filter(Boolean) : [],
    arquivos: dto.arquivos.map((a) => ({
      nome: a.nome,
      url: apiFileUrl(a.downloadUrl),
      downloadUrl: apiDownloadUrl(a.downloadUrl),
      tamanho: a.tamanhoBytes,
    })),
    status: dto.status,
    criado_em: dto.createdAt,
    atualizado_em: dto.updatedAt ?? undefined,
    downloads_count: dto.downloadsCount,
    deleted_at: dto.deletedAt ?? null,
  };
}

function toRequestBody(payload: Partial<Ata>) {
  return {
    numero: payload.numero ?? "",
    titulo: payload.titulo ?? "",
    tipo: payload.tipo ?? null,
    descricao: payload.descricao ?? null,
    data: payload.data,
    horario: payload.horario ? payload.horario : null,
    local: payload.local ?? null,
    presidente: payload.presidente ?? "",
    secretario: payload.secretario ?? null,
    participantes: (payload.participantes ?? []).join(", ") || null,
    status: payload.status ?? "Rascunho",
    categoriaId: payload.categoria_id?.[0] ?? null,
  };
}

// GET — lista todas as atas ativas (não excluídas)
export async function getAtas() {
  const { data, error } = await apiGet<PagedResult<AtaDto>>(`${BASE}?pageSize=${FETCH_ALL_PAGE_SIZE}`);
  return { data: data ? data.items.map(fromDto) : null, error };
}

// GET — lista as atas na lixeira (excluídas)
export async function getAtasLixeira() {
  const { data, error } = await apiGet<PagedResult<AtaDto>>(`${BASE}/lixeira?pageSize=${FETCH_ALL_PAGE_SIZE}`);
  return { data: data ? data.items.map(fromDto) : null, error };
}

// GET por id
export async function getAtaById(id: string) {
  const { data, error } = await apiGet<AtaDto>(`${BASE}/${id}`);
  return { data: data ? fromDto(data) : null, error };
}

// POST — cria uma nova ata
export async function createAta(payload: Omit<Ata, "id" | "criado_em" | "atualizado_em" | "downloads_count">) {
  const { data, error } = await apiPost<AtaDto>(BASE, toRequestBody(payload));
  return { data: data ? fromDto(data) : null, error };
}

// PUT — atualiza uma ata existente
export async function updateAta(id: string, payload: Partial<Ata>) {
  const { data: atual, error: getError } = await getAtaById(id);
  if (getError || !atual) return { data: null, error: getError ?? new Error("Ata não encontrada.") };

  const merged = { ...atual, ...payload };
  const { data, error } = await apiPut<AtaDto>(`${BASE}/${id}`, toRequestBody(merged));
  return { data: data ? fromDto(data) : null, error };
}

// Incrementa o contador de downloads de uma ata (feito no servidor; currentCount
// é ignorado, mantido só pra não quebrar quem já chama essa função)
export async function incrementDownloads(id: string, _currentCount?: number) {
  const { data, error } = await apiPost<AtaDto>(`${BASE}/${id}/download`);
  return { data: data ? fromDto(data) : null, error };
}

// DELETE — soft delete (move para a lixeira)
export async function deleteAta(id: string) {
  const { error } = await apiDelete(`${BASE}/${id}`);
  return { error };
}

// Restaura uma ata da lixeira
export async function restoreAta(id: string) {
  const { data, error } = await apiPost<AtaDto>(`${BASE}/${id}/restaurar`);
  return { data: data ? fromDto(data) : null, error };
}

// Exclui definitivamente (irreversível)
export async function purgeAta(id: string) {
  const { error } = await apiDelete(`${BASE}/${id}/definitivo`);
  return { error };
}
