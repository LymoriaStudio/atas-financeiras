import { supabase } from "../supabase";

const TABLE = "atas";

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
  arquivos: { nome: string; url: string; tamanho?: number }[];
  status: string;
  criado_em?: string;
  atualizado_em?: string;
  downloads_count?: number;
  deleted_at?: string | null;
}

// GET — lista todas as atas ativas (não excluídas)
export async function getAtas() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .is("deleted_at", null)
    .order("criado_em", { ascending: false });

  return { data: data as Ata[] | null, error };
}

// GET — lista as atas na lixeira (excluídas)
export async function getAtasLixeira() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  return { data: data as Ata[] | null, error };
}

// GET por id
export async function getAtaById(id: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  return { data: data as Ata | null, error };
}

// POST — cria uma nova ata
export async function createAta(payload: Omit<Ata, "id" | "criado_em" | "atualizado_em" | "downloads_count">) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      id: crypto.randomUUID(),
      ...payload,
    })
    .select()
    .single();

  return { data: data as Ata | null, error };
}

// PUT — atualiza uma ata existente
export async function updateAta(id: string, payload: Partial<Ata>) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      ...payload,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  return { data: data as Ata | null, error };
}

// Incrementa o contador de downloads de uma ata
export async function incrementDownloads(id: string, currentCount: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ downloads_count: (currentCount ?? 0) + 1 })
    .eq("id", id)
    .select()
    .single();

  return { data: data as Ata | null, error };
}

// DELETE — soft delete (move para a lixeira)
export async function deleteAta(id: string) {
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}

// Restaura uma ata da lixeira
export async function restoreAta(id: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ deleted_at: null })
    .eq("id", id)
    .select()
    .single();
  return { data: data as Ata | null, error };
}

// Exclui definitivamente (irreversível)
export async function purgeAta(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  return { error };
}