import { supabase } from "../supabase";

const TABLE = "atividades";

export interface Atividade {
  id: string;
  usuario_id: string | null;
  acao: string;
  documento: string | null;
  criado_em: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

// Registra uma ação no log de atividades (best-effort, não bloqueia o fluxo principal)
export async function logAtividade(acao: string, documento?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: null };

  const { error } = await supabase.from(TABLE).insert({
    usuario_id: user.id,
    acao,
    documento: documento ?? null,
  });

  return { error };
}

// GET — últimas atividades, com nome/avatar de quem realizou a ação
export async function getAtividadesRecentes(limit = 6) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*, profiles(full_name, avatar_url)")
    .order("criado_em", { ascending: false })
    .limit(limit);

  return { data: data as Atividade[] | null, error };
}
