import { supabase } from "../supabase";

const TABLE = "atividades";
const NOTIF_TABLE = "notificacoes";

export interface Atividade {
  id: string;
  usuario_id: string | null;
  acao: string;
  documento: string | null;
  criado_em: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

// Registra uma ação no log de atividades (best-effort, não bloqueia o fluxo principal)
// usuario_id fica null quando a ação vem de um visitante anônimo do site público
export async function logAtividade(acao: string, documento?: string) {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from(TABLE).insert({
    usuario_id: user?.id ?? null,
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

// GET — ids das atividades já marcadas como visualizadas pelo usuário logado
export async function getNotificacoesVisualizadas() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: new Set<string>(), error: null };

  const { data, error } = await supabase
    .from(NOTIF_TABLE)
    .select("atividade_id")
    .eq("usuario_id", user.id)
    .eq("viewed", true);

  if (error) return { data: null, error };

  return { data: new Set((data ?? []).map((n) => n.atividade_id as string)), error: null };
}

// Marca (ou desmarca) uma atividade como visualizada pelo usuário logado
export async function toggleNotificacaoVisualizada(atividadeId: string, viewed: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: null };

  const { error } = await supabase
    .from(NOTIF_TABLE)
    .upsert(
      {
        atividade_id: atividadeId,
        usuario_id: user.id,
        viewed,
        viewed_at: viewed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "atividade_id,usuario_id" }
    );

  return { error };
}
