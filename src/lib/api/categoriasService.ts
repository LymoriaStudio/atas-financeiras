import { apiDelete, apiGet, apiPost, apiPut } from "./httpClient";

const BASE = "/api/categorias";

export interface Categoria {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  count: number;
  color: string;
  created_at?: string;
  updated_at?: string;
  mostrar_no_site?: boolean;
  ordem_site?: number | null;
}

// DTO cru devolvido pela API (.NET), em camelCase.
interface CategoriaDto {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  mostrarNoSite: boolean;
  ordemSite?: number | null;
  atasCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

function fromDto(dto: CategoriaDto): Categoria {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    description: dto.description ?? "",
    icon: dto.icon ?? "",
    count: dto.atasCount,
    color: dto.color ?? "",
    created_at: dto.createdAt,
    updated_at: dto.updatedAt ?? undefined,
    mostrar_no_site: dto.mostrarNoSite,
    ordem_site: dto.ordemSite ?? null,
  };
}

// GET — lista todas as categorias
export async function getCategorias() {
  const { data, error } = await apiGet<CategoriaDto[]>(BASE);
  return { data: data ? data.map(fromDto) : null, error };
}

// GET por id
export async function getCategoriaById(id: string) {
  const { data, error } = await apiGet<CategoriaDto>(`${BASE}/${id}`);
  return { data: data ? fromDto(data) : null, error };
}

// POST — cria uma nova categoria
export async function createCategoria(payload: Omit<Categoria, "id" | "slug" | "created_at" | "updated_at">) {
  const { data, error } = await apiPost<CategoriaDto>(BASE, {
    name: payload.name,
    description: payload.description,
    icon: payload.icon,
    color: payload.color,
    mostrarNoSite: payload.mostrar_no_site ?? true,
    ordemSite: payload.ordem_site ?? null,
  });
  return { data: data ? fromDto(data) : null, error };
}

// PUT — atualiza uma categoria existente
export async function updateCategoria(id: string, payload: Partial<Omit<Categoria, "id">>) {
  // A API espera o objeto completo no PUT — busca o atual e aplica o patch por cima.
  const { data: atual, error: getError } = await getCategoriaById(id);
  if (getError || !atual) return { data: null, error: getError ?? new Error("Categoria não encontrada.") };

  const merged = { ...atual, ...payload };
  const { data, error } = await apiPut<CategoriaDto>(`${BASE}/${id}`, {
    name: merged.name,
    description: merged.description,
    icon: merged.icon,
    color: merged.color,
    mostrarNoSite: merged.mostrar_no_site ?? true,
    ordemSite: merged.ordem_site ?? null,
  });
  return { data: data ? fromDto(data) : null, error };
}

// DELETE
export async function deleteCategoria(id: string) {
  const { error } = await apiDelete(`${BASE}/${id}`);
  return { error };
}

// Atualiza em lote a visibilidade/ordem das categorias na vitrine do site
export async function updateOrdemSite(rows: { id: string; mostrar_no_site: boolean; ordem_site: number | null }[]) {
  const { error } = await apiPut(`${BASE}/ordem-site`, {
    itens: rows.map((r) => ({
      categoriaId: r.id,
      mostrarNoSite: r.mostrar_no_site,
      ordemSite: r.ordem_site,
    })),
  });
  return { error };
}
