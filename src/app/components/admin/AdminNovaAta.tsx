import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  FileText,
  User,
  Upload,
  X,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { createAta } from "../../../lib/api/atasService";
import { uploadAtaFile } from "../../../lib/api/storageService";
import { getCategorias, type Categoria } from "../../../lib/api/categoriasService";
import { logAtividade } from "../../../lib/api/atividadesService";
import type { Usuario } from "../../../lib/api/usuarioService";

const TIPOS = ["Estatuto", "Financeiro", "Atas"];
const ALLOWED_EXT = ["pdf", "docx", "xlsx"];
const MAX_SIZE_MB = 15;

type ArquivoState = { nome: string; url: string; tamanho: number; ext: string };

export function AdminNovaAta() {
  const navigate = useNavigate();
  const { usuario } = useOutletContext<{ usuario: Usuario | null }>();

  // Viewer não pode criar atas — redireciona de volta
  useEffect(() => {
    if (usuario && usuario.role === "viewer") {
      navigate("/admin/atas");
    }
  }, [usuario, navigate]);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasLoading, setCategoriasLoading] = useState(true);

  const [numero, setNumero] = useState("ATA - ");
  const [titulo, setTitulo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [presidente, setPresidente] = useState("");
  const [status, setStatus] = useState<"Publicado" | "Rascunho">("Publicado");

  const [arquivos, setArquivos] = useState<ArquivoState[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    setCategoriasLoading(true);
    const { data, error } = await getCategorias();
    if (!error && data) {
      setCategorias(data);
      if (data.length > 0) setCategoriaId((prev) => prev || data[0].id);
    }
    setCategoriasLoading(false);
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadFiles = async (fileList: FileList) => {
    setIsUploading(true);
    setUploadError(null);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      if (!ALLOWED_EXT.includes(ext)) {
        setUploadError("Apenas arquivos PDF, DOCX ou XLSX são aceitos!");
        continue;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setUploadError(`Arquivo muito grande. Máximo ${MAX_SIZE_MB} MB.`);
        continue;
      }

      const { arquivo, error } = await uploadAtaFile(file);
      if (error || !arquivo) {
        setUploadError("Erro ao enviar arquivo. Tente novamente.");
        continue;
      }

      setArquivos((prev) => [
        ...prev,
        { nome: arquivo.nome, url: arquivo.url, tamanho: arquivo.tamanho ?? file.size, ext },
      ]);
    }

    setIsUploading(false);
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFiles(e.target.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setArquivos((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!numero.trim() || numero === "ATA - ") {
      setErrorMsg("Por favor, informe o número da ata para identificação.");
      return;
    }
    if (!titulo.trim()) {
      setErrorMsg("Por favor, defina o título da ata.");
      return;
    }

    setSubmitting(true);

    const { error } = await createAta({
      numero,
      titulo,
      tipo: TIPOS[0],
      categoria_id: categoriaId ? [categoriaId] : [],
      descricao: "",
      data: new Date().toISOString().split("T")[0],
      horario: "",
      local: "",
      presidente,
      secretario: "",
      participantes: [],
      arquivos: arquivos.map(({ nome, url, tamanho }) => ({ nome, url, tamanho })),
      status,
    });

    if (error) {
      setErrorMsg("Erro ao criar ata. Tente novamente.");
      setSubmitting(false);
      return;
    }

    logAtividade("publicou uma nova ata", titulo);
    navigate("/admin/atas");
  };

  if (usuario?.role === "viewer") return null;

  return (
    <div id="nova-ata-view" className="space-y-6">
      {/* UPPER TITLE BAR */}
      <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left">
        <button
          onClick={() => navigate("/admin/atas")}
          className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200/60 rounded-xl transition-all"
          title="Voltar para a listagem"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-950">Nova Ata Eletrônica</h2>
          <p className="text-xs text-gray-400 mt-1">Gere atas formais e vincule anexos oficiais imediatamente</p>
        </div>
      </div>

      {errorMsg && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* COL 1 & 2: REUNIÃO & ATA DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          {/* CARD 1: INFORMAÇÕES GERAIS */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Dados Principais da Ata</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Identificador / Número */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Número / Código Identificador *
                </label>
                <input
                  id="form-numero-ata"
                  type="text"
                  required
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ex: ATA - 1538/1423.727"
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 font-medium"
                />
              </div>

              {/* Categorias */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Categoria da Ata *
                </label>
                {categoriasLoading ? (
                  <div className="flex items-center gap-2 text-gray-400 text-xs py-2.5">
                    <Loader2 size={13} className="animate-spin" />
                    Carregando categorias...
                  </div>
                ) : (
                  <select
                    id="form-categoria-ata"
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 font-medium"
                  >
                    {categorias.length === 0 && <option value="">Nenhuma categoria cadastrada</option>}
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Título da Ata */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Título Geral da Reunião / Assunto Principal *
              </label>
              <input
                id="form-titulo-ata"
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Reunião extraordinária para realocação de servidores"
                className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 font-medium"
              />
            </div>
          </div>

          {/* CARD 3: FILE UPLOAD DRAGZONE */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Arquivos de Apoio / Anexos Oficiais</span>
            </h3>

            <p className="text-xs text-gray-400 leading-normal">
              Anexe arquivos relevantes de formatação oficial (PDF, DOCX, XLSX). O tamanho máximo recomendado é {MAX_SIZE_MB}MB.
            </p>

            {/* DRAG AND DROP ZONE */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive
                  ? "border-blue-600 bg-blue-50/40"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <input
                id="file-upload-input"
                type="file"
                multiple
                accept=".pdf,.docx,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />

              <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400 animate-pulse mb-3" />
                <span className="text-xs font-bold text-gray-700">Arraste seus arquivos aqui ou clique para upload</span>
                <span className="text-[11px] text-gray-400 mt-1">Formatos suportados: PDF, Word (.docx), Excel (.xlsx)</span>
              </label>
            </div>

            {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}

            {isUploading && (
              <div className="text-xs text-blue-600 font-medium flex items-center gap-2">
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                <span>Processando arquivos anexos...</span>
              </div>
            )}

            {arquivos.length > 0 && (
              <div className="space-y-2 mt-2">
                {arquivos.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold uppercase py-0.5 px-1.5 bg-slate-200 text-slate-700 rounded select-none shrink-0">
                        {file.ext}
                      </span>
                      <span className="text-gray-700 font-semibold truncate max-w-xs">{file.nome}</span>
                      <span className="text-gray-400">({formatSize(file.tamanho)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50/60"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COL 3: PRESIDENT & SECRETARY & MULTIPLE PARTICIPANTS LIST */}
        <div className="space-y-6">
          {/* CARD 4: RESPONSÁVEL PELA REUNIÃO */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Responsável pela Reunião</span>
            </h3>

            {/* Presidente */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Presidente / Moderador *
              </label>
              <input
                id="form-presidente-ata"
                type="text"
                required
                value={presidente}
                onChange={(e) => setPresidente(e.target.value)}
                placeholder="Nome do moderador da mesa"
                className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 font-medium"
              />
            </div>
          </div>

          {/* CARD 6: STATUS & ACTION BUTTONS */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              Status de Divulgação
            </h3>

            {/* Toggle public or draft preview */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setStatus("Publicado")}
                className={`flex-1 text-xs font-bold text-center py-2 rounded-lg transition-all ${
                  status === "Publicado"
                    ? "bg-white text-emerald-700 shadow-sm font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Publicada
              </button>
              <button
                type="button"
                onClick={() => setStatus("Rascunho")}
                className={`flex-1 text-xs font-bold text-center py-2 rounded-lg transition-all ${
                  status === "Rascunho"
                    ? "bg-white text-amber-700 shadow-sm font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Rascunho
              </button>
            </div>

            {/* Main triggers: Save & Cancel */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                id="btn-salvar-nova-ata"
                disabled={submitting}
                className="btn-primary w-full py-2.5 text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Documento"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/atas")}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
