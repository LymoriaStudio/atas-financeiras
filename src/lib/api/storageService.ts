import { supabase } from "../supabase";

const BUCKET = "atas-files";

export async function uploadAtaFile(file: File) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) return { arquivo: null, error };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  return {
    arquivo: { nome: file.name, url: data.publicUrl, tamanho: file.size },
    error: null,
  };
}