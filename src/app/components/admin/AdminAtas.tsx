import { useEffect, useState } from "react";
import { Plus, Search, ChevronDown, Eye, Pencil, Trash2, X, Upload, Check, Loader2, Download, FileX } from "lucide-react";
import { getAtas, createAta, updateAta, deleteAta, type Ata } from "../../../lib/api/atasService";
import { uploadAtaFile } from "../../../lib/api/storageService";
import { getCategorias, type Categoria } from "../../../lib/api/categoriasService";

const TIPOS = ["Estatuto", "Financeiro", "Atas"];

type ModalMode = "add" | "edit" | null;

type FormState = {
  numero: string;
  titulo: string;
  tipo: string;
  categoria_id: string[];
  descricao: string;
  data: string;
  horario: string;
  local: string;
  presidente: string;
  secretario: string;
  participantes: string[];
  status: string;
};

const emptyForm: FormState = {
  numero: "",
  titulo: "",
  tipo: TIPOS[0],
  categoria_id: [],
  descricao: "",
  data: "",
  horario: "",
  local: "",
  presidente: "",
  secretario: "",
  participantes: [],
  status: "Publicado",
};

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function toArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.length) return [raw];
  return [];
}

function getLatestFile(ata: Ata) {
  if (!ata.arquivos || ata.arquivos.length === 0) return null;
  return ata.arquivos[ata.arquivos.length - 1];
}

function getTipoStyle(tipo: string): { backgroundColor: string; color: string } {
  const map: Record<string, { backgroundColor: string; color: string }> = {
    "Atas":           { backgroundColor: "#EFF6FF", color: "#3B82F6" },
    "Financeiro":     { backgroundColor: "#F0FDF4", color: "#22C55E" },
    "Estatuto":       { backgroundColor: "#FAF5FF", color: "#A855F7" },
    "Administrativo": { backgroundColor: "#FFF7ED", color: "#F97316" },
    "Contratos":      { backgroundColor: "#FFF1F2", color: "#F43F5E" },
    "Reuniões":       { backgroundColor: "#F0FDFA", color: "#14B8A6" },
  };
  return map[tipo] ?? { backgroundColor: "#11182715", color: "#111827" };
}

const STATUS_FILTERS = ["Todos", "Publicado", "Rascunho", "Arquivado"];

export function AdminAtas() {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasLoading, setCategoriasLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState("Todas");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingAta, setViewingAta] = useState<Ata | null>(null);
  const [saved, setSaved] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingArquivos, setExistingArquivos] = useState<Ata["arquivos"]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [participanteInput, setParticipanteInput] = useState("");

  useEffect(() => {
    fetchAtas();
    fetchCategorias();
  }, []);

  async function fetchAtas() {
    setLoading(true);
    setErrorMsg(null);
    const { data, error } = await getAtas();
    if (error) {
      setErrorMsg("Não foi possível carregar as atas. Tente novamente.");
    } else {
      setAtas(data ?? []);
    }
    setLoading(false);
  }

  async function fetchCategorias() {
    setCategoriasLoading(true);
    const { data, error } = await getCategorias();
    if (!error && data) {
      setCategorias(data);
    }
    setCategoriasLoading(false);
  }

  const categoriaMap = Object.fromEntries(categorias.map((c) => [c.id, c]));

  const filtered = atas.filter((a) => {
    const q = query.toLowerCase();
    const tipo = (a as any).tipo ?? "";
    const matchesCat = filterCat === "Todas" || tipo === filterCat;
    const matchesStatus = filterStatus === "Todos" || a.status === filterStatus;
    return (
      matchesCat &&
      matchesStatus &&
      (a.titulo.toLowerCase().includes(q) || a.numero.toLowerCase().includes(q))
    );
  });

  const openAdd = () => {
    setForm(emptyForm);
    setModal("add");
    setEditingId(null);
    setSelectedFile(null);
    setExistingArquivos([]);
    setParticipanteInput("");
  };

  const openEdit = (ata: Ata) => {
    setForm({
      numero: ata.numero,
      titulo: ata.titulo,
      tipo: (ata as any).tipo ?? TIPOS[0],
      categoria_id: toArray((ata as any).categoria_id),
      descricao: ata.descricao,
      data: ata.data?.slice(0, 10) ?? "",
      horario: ata.horario?.slice(0, 5) ?? "",
      local: ata.local,
      presidente: ata.presidente,
      secretario: ata.secretario,
      participantes: ata.participantes ?? [],
      status: ata.status,
    });
    setEditingId(ata.id);
    setModal("edit");
    setSelectedFile(null);
    setExistingArquivos(ata.arquivos ?? []);
    setParticipanteInput("");
  };

  const closeModal = () => {
    setModal(null);
    setForm(emptyForm);
    setEditingId(null);
    setSelectedFile(null);
    setExistingArquivos([]);
    setUploadError(null);
    setParticipanteInput("");
  };

  const openView = (ata: Ata) => setViewingAta(ata);
  const closeView = () => setViewingAta(null);

  const toggleDepartamento = (id: string) => {
    setForm((prev) => ({
      ...prev,
      categoria_id: prev.categoria_id.includes(id)
        ? prev.categoria_id.filter((d) => d !== id)
        : [...prev.categoria_id, id],
    }));
  };

  const handleParticipanteInputChange = (value: string) => {
    if (value.includes(",")) {
      const parts = value.split(",");
      const novosNomes = parts
        .slice(0, -1)
        .map((p) => p.trim())
        .filter(Boolean);
      if (novosNomes.length) {
        setForm((prev) => ({
          ...prev,
          participantes: [...prev.participantes, ...novosNomes],
        }));
      }
      setParticipanteInput(parts[parts.length - 1]);
    } else {
      setParticipanteInput(value);
    }
  };

  const handleParticipanteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && participanteInput.trim()) {
      e.preventDefault();
      setForm((prev) => ({
        ...prev,
        participantes: [...prev.participantes, participanteInput.trim()],
      }));
      setParticipanteInput("");
    }
    if (e.key === "Backspace" && !participanteInput && form.participantes.length) {
      setForm((prev) => ({
        ...prev,
        participantes: prev.participantes.slice(0, -1),
      }));
    }
  };

  const removeParticipante = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      participantes: prev.participantes.filter((_, i) => i !== idx),
    }));
  };

  const saveForm = async () => {
    if (!form.numero || !form.titulo || !form.data || !form.horario) return;
    setSubmitting(true);
    setErrorMsg(null);
    setUploadError(null);

    let arquivos = existingArquivos;

    if (selectedFile) {
      const { arquivo, error: uploadErr } = await uploadAtaFile(selectedFile);
      if (uploadErr || !arquivo) {
        setUploadError("Erro ao enviar o arquivo. Tente novamente.");
        setSubmitting(false);
        return;
      }
      arquivos = [...existingArquivos, arquivo];
    }

    const payload = {
      numero: form.numero,
      titulo: form.titulo,
      tipo: form.tipo,
      categoria_id: form.categoria_id,
      descricao: form.descricao,
      data: form.data,
      horario: form.horario.length === 5 ? `${form.horario}:00` : form.horario,
      local: form.local,
      presidente: form.presidente,
      secretario: form.secretario,
      participantes: form.participantes,
      arquivos,
      status: form.status,
    } as any;

    if (modal === "add") {
      const { data, error } = await createAta(payload);
      if (!error && data) {
        setAtas((prev) => [data, ...prev]);
      } else {
        setErrorMsg("Erro ao criar ata. Tente novamente.");
        setSubmitting(false);
        return;
      }
    } else if (modal === "edit" && editingId) {
      const { data, error } = await updateAta(editingId, payload);
      if (!error && data) {
        setAtas((prev) => prev.map((a) => (a.id === editingId ? data : a)));
      } else {
        setErrorMsg("Erro ao salvar alterações. Tente novamente.");
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); closeModal(); }, 700);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const { error } = await deleteAta(deletingId);
    if (!error) {
      setAtas((prev) => prev.filter((a) => a.id !== deletingId));
    } else {
      setErrorMsg("Erro ao excluir o documento.");
    }
    setDeletingId(null);
  };

  const viewingFile = viewingAta ? getLatestFile(viewingAta) : null;

  return (
    <div className="p-4 sm:p-4 lg:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700 }}>Gerenciar Atas</h1>
          <p className="text-gray-400 text-sm mt-1">Adicione, edite, categorize ou exclua documentos</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 text-white text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto shrink-0"
          style={{ backgroundColor: "#111827" }}
        >
          <Plus size={16} />
          Nova Ata
        </button>
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título ou número..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none"
          >
            {["Todas", ...TIPOS].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Status filter buttons */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="px-4 py-1.5 rounded-full text-xs font-medium border transition-all"
            style={
              filterStatus === s
                ? { backgroundColor: "#111827", color: "#fff", borderColor: "#111827" }
                : { backgroundColor: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex items-center justify-center gap-2 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 size={16} className="animate-spin" />
          Carregando atas...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100 shadow-sm">
          Nenhum documento encontrado.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-3.5 border-b border-gray-100 bg-gray-50">
              <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nº da ATA</div>
              <div className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Título</div>
              <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</div>
              <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</div>
              <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</div>
              <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Ações</div>
            </div>

            {filtered.map((ata) => {
              const tipo = (ata as any).tipo ?? "";
              return (
                <div key={ata.id} className="grid grid-cols-12 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors items-center">
                  <div className="col-span-3 text-gray-700 text-xs font-medium truncate pr-2">{ata.numero}</div>
                  <div className="col-span-4 text-gray-600 text-sm truncate pr-4">{ata.titulo}</div>
                  <div className="col-span-2">
                    {tipo ? (
                      <span
                        className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                        style={getTipoStyle(tipo)}
                      >
                        {tipo}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </div>
                  <div className="col-span-1 text-gray-500 text-xs">{formatDate(ata.data)}</div>
                  <div className="col-span-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      ata.status === "Publicado"
                        ? "bg-green-50 text-green-700"
                        : ata.status === "Arquivado"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {ata.status}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <button onClick={() => openView(ata)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Visualizar">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => openEdit(ata)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDeletingId(ata.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Excluir">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((ata) => {
              const tipo = (ata as any).tipo ?? "";
              return (
                <div key={ata.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-gray-700 text-xs font-semibold truncate">{ata.numero}</p>
                      <p className="text-gray-800 text-sm font-medium mt-0.5 truncate">{ata.titulo}</p>
                    </div>
                    <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      ata.status === "Publicado"
                        ? "bg-green-50 text-green-700"
                        : ata.status === "Arquivado"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {ata.status}
                    </span>
                  </div>

                  <p className="text-gray-400 text-xs mb-2">{formatDate(ata.data)}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {tipo ? (
                      <span
                        className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                        style={getTipoStyle(tipo)}
                      >
                        {tipo}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">Sem tipo</span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-50">
                    <button onClick={() => openView(ata)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Visualizar">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => openEdit(ata)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeletingId(ata.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="text-gray-400 text-xs mt-3 text-right">{filtered.length} documento{filtered.length !== 1 ? "s" : ""}</p>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 shrink-0">
              <h2 style={{ color: "#111827", fontWeight: 700 }}>
                {modal === "add" ? "Nova Ata" : "Editar Ata"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nº da ATA</label>
                  <input
                    value={form.numero}
                    onChange={(e) => setForm({ ...form, numero: e.target.value })}
                    placeholder="ATA - 0001/2026.001"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoria</label>
                  <div className="relative">
                    <select
                      value={form.tipo}
                      onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                      className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none"
                    >
                      {TIPOS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título</label>
                <input
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ex: Ata da Assembleia Geral Ordinária"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Data</label>
                  <input
                    type="date"
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Local</label>
                  <input
                    value={form.local}
                    onChange={(e) => setForm({ ...form, local: e.target.value })}
                    placeholder="Sede da empresa"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>

              {/* Participantes */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Participantes</label>
                <div className="w-full px-3 py-2 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-gray-200 flex flex-wrap gap-2">
                  {form.participantes.map((nome, idx) => (
                    <span
                      key={`${nome}-${idx}`}
                      className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg"
                    >
                      {nome}
                      <button type="button" onClick={() => removeParticipante(idx)} className="text-gray-400 hover:text-gray-700">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <input
                    value={participanteInput}
                    onChange={(e) => handleParticipanteInputChange(e.target.value)}
                    onKeyDown={handleParticipanteKeyDown}
                    placeholder={form.participantes.length ? "" : "Digite e use vírgula para separar"}
                    className="flex-1 min-w-[120px] text-sm text-gray-700 focus:outline-none py-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  rows={3}
                  placeholder="Resumo do que foi tratado na reunião"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                />
              </div>

              {/* Departamentos */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Departamentos Participantes</label>
                {categoriasLoading ? (
                  <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                    <Loader2 size={13} className="animate-spin" />
                    Carregando departamentos...
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-3 flex flex-col gap-1">
                    {categorias.map((cat) => {
                      const checked = form.categoria_id.includes(cat.id);
                      return (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDepartamento(cat.id)}
                            className="sr-only peer"
                          />
                          <span
                            className="w-4 h-4 rounded-[2px] border-2 flex items-center justify-center shrink-0 transition-colors"
                            style={{ borderColor: "gray", backgroundColor: "white" }}
                          >
                            {checked && <Check size={11} className="text-[#111827]" />}
                          </span>
                          <span className="text-sm text-gray-700">{cat.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {form.categoria_id.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.categoria_id.map((id) => {
                      const cat = categoriaMap[id];
                      if (!cat) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                        >
                          {cat.name}
                          <button type="button" onClick={() => toggleDepartamento(id)} className="hover:opacity-70">
                            <X size={11} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <div className="flex gap-3">
                  {["Publicado", "Rascunho"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all"
                      style={
                        form.status === s
                          ? { backgroundColor: "#111827", color: "#fff", borderColor: "#111827" }
                          : { backgroundColor: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* File upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Arquivo (PDF)</label>
                <label
                  htmlFor="ata-file-input"
                  className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center gap-2 text-center cursor-pointer hover:border-gray-300 transition-colors block"
                >
                  <Upload size={20} className="text-gray-400" />
                  <p className="text-gray-500 text-xs font-medium">
                    {selectedFile ? selectedFile.name : "Clique para selecionar ou arraste o PDF"}
                  </p>
                  <p className="text-gray-300 text-xs">Tamanho máximo: 10 MB</p>
                  <input
                    id="ata-file-input"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > 10 * 1024 * 1024) {
                        setUploadError("Arquivo muito grande. Máximo 10 MB.");
                        return;
                      }
                      setUploadError(null);
                      setSelectedFile(file ?? null);
                    }}
                  />
                </label>

                {uploadError && (
                  <p className="text-red-500 text-xs mt-1.5">{uploadError}</p>
                )}

                {existingArquivos.length > 0 && !selectedFile && (
                  <p className="text-gray-400 text-xs mt-1.5">
                    Arquivo atual: {existingArquivos[existingArquivos.length - 1].nome}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-100 shrink-0">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={saveForm}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{ backgroundColor: saved ? "#15803D" : "#111827" }}
              >
                {submitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : saved ? (
                  <><Check size={15} /> Salvo!</>
                ) : modal === "add" ? "Adicionar" : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingAta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">

            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="min-w-0">
                <p className="text-gray-700 text-xs font-semibold truncate">{viewingAta.numero}</p>
                <p style={{ color: "#111827", fontWeight: 700 }} className="text-sm truncate">{viewingAta.titulo}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {viewingFile && (
                  <a
                    href={viewingFile.url}
                    download={viewingFile.nome}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Baixar</span>
                  </a>
                )}
                <button onClick={closeView} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-100">
              {viewingFile ? (
                <iframe
                  src={viewingFile.url}
                  title={`PDF de ${viewingAta.titulo}`}
                  className="w-full h-full"
                  style={{ border: "none" }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                  <FileX size={32} />
                  <p className="text-sm">Nenhum arquivo anexado a esta ata.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 style={{ color: "#111827", fontWeight: 700, fontSize: "1rem" }} className="mb-2">Excluir documento?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Esta ação não pode ser desfeita. O documento será removido permanentemente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}