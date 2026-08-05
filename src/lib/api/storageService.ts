import { apiDownloadUrl, apiFileUrl, apiUpload } from "./httpClient";

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

// A API própria ainda não tem um endpoint de upload de foto de perfil —
// isso ficou fora do escopo desta primeira integração.
export async function uploadProfilePic(_file: File, _userId: string) {
  return { url: null, error: new Error("Upload de foto de perfil ainda não disponível na nova API.") };
}
