import { supabase } from "../supabase";

const TABLE = "ata_categories";

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
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET — lista todas as categorias
export async function getCategorias() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  return { data: data as Categoria[] | null, error };
}

// GET por id
export async function getCategoriaById(id: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  return { data: data as Categoria | null, error };
}

// POST — cria uma nova categoria
export async function createCategoria(payload: Omit<Categoria, "id" | "slug" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      ...payload,
      slug: toSlug(payload.name),
    })
    .select()
    .single();

  return { data: data as Categoria | null, error };
}

// PUT — atualiza uma categoria existente
export async function updateCategoria(id: string, payload: Partial<Omit<Categoria, "id">>) {
  const updatePayload = { ...payload };
  if (payload.name) {
    updatePayload.slug = toSlug(payload.name);
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  return { data: data as Categoria | null, error };
}

// DELETE
export async function deleteCategoria(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  return { error };
}