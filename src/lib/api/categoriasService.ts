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
  mostrar_no_site?: boolean;
  ordem_site?: number | null;
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

// Atualiza em lote a visibilidade/ordem das categorias na vitrine do site
// (update por linha, não upsert — evita violar colunas NOT NULL que não fazem parte deste payload)
//
// Feito em duas fases: primeiro zera o ordem_site de todas as linhas envolvidas,
// depois aplica os valores finais. Sem isso, dois updates concorrentes podem se
// cruzar (ex: categoria nova assumindo ordem_site=3 antes da antiga liberar esse
// valor) e violar a constraint de unicidade — gerando um 409 (código 23505)
// que só "passa" se as requisições pousarem na ordem certa por sorte.
export async function updateOrdemSite(rows: { id: string; mostrar_no_site: boolean; ordem_site: number | null }[]) {
  const clearResults = await Promise.all(
    rows.map((r) => supabase.from(TABLE).update({ ordem_site: null }).eq("id", r.id))
  );
  const clearError = clearResults.find((r) => r.error)?.error ?? null;
  if (clearError) return { error: clearError };

  const results = await Promise.all(
    rows.map((r) =>
      supabase
        .from(TABLE)
        .update({ mostrar_no_site: r.mostrar_no_site, ordem_site: r.ordem_site })
        .eq("id", r.id)
    )
  );
  const error = results.find((r) => r.error)?.error ?? null;
  return { error };
}