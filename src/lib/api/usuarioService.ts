import { supabase } from "../supabase";

const TABLE = "profiles";

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

export async function getUsuarios() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data as Usuario[] | null, error };
}

export async function getUsuarioById(id: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  return { data: data as Usuario | null, error };
}

export async function createUsuario(
  payload: Omit<Usuario, "id" | "created_at" | "updated_at"> & { password?: string }
) {
  const { data, error } = await supabase.functions.invoke("create-user", {
    body: payload,
  });

  if (error) return { data: null, error };
  if (data?.error) return { data: null, error: new Error(data.error) };

  return { data: data?.user as Usuario | null, error: null };
}

export async function updateUsuario(id: string, payload: Partial<Omit<Usuario, "id">>) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data: data as Usuario | null, error };
}

export async function deleteUsuario(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  return { error };
}