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
}

// GET — lista todas as atas
export async function getAtas() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("criado_em", { ascending: false });

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

// DELETE
export async function deleteAta(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  return { error };
}