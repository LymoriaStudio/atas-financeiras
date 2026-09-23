import { apiDownloadUrl, apiFileUrl, apiUpload } from "./httpClient";
import { fromDto, type UsuarioDto } from "./usuarioService";

interface AtaArquivoDto {
  id: string;
  nome: string;
  contentType: string;
  tamanhoBytes: number;
  createdAt: string;
  downloadUrl: string;
}

// Diferente do Supabase Storage: aqui o arquivo é vinculado a uma ata que já existe
// (o backend liga o arquivo pelo id da ata na URL), então precisa do ataId.
export async function uploadAtaFile(ataId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data, error } = await apiUpload<AtaArquivoDto>(`/api/atas/${ataId}/arquivos`, formData);
  if (error || !data) return { arquivo: null, error };

  return {
    arquivo: {
      nome: data.nome,
      url: apiFileUrl(data.downloadUrl),
      downloadUrl: apiDownloadUrl(data.downloadUrl),
      tamanho: data.tamanhoBytes,
    },
    error: null,
  };
}

// _userId fica só por compatibilidade de assinatura — o backend sempre troca o avatar
// do usuário autenticado (via token), não aceita trocar o de outra pessoa por id.
export async function uploadProfilePic(file: File, _userId: string) {
  const formData = new FormData();
  formData.append("file", file);

  const { data, error } = await apiUpload<UsuarioDto>("/api/auth/avatar", formData);
  if (error || !data) return { url: null, usuario: null, error };

  const usuario = fromDto(data);
  // Cache-busting: o navegador não sabe que o conteúdo por trás dessa URL mudou.
  const url = usuario.avatar_url ? `${usuario.avatar_url}?t=${Date.now()}` : null;

  return { url, usuario: { ...usuario, avatar_url: url ?? usuario.avatar_url }, error: null };
}
