import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import * as XLSX from "xlsx-js-style";
import {
  Plus, Search, ChevronDown, Eye, Pencil, Trash2, X, Upload, Check, Loader2,
  Download, FileX, ArrowUpDown, Layers, Calendar, FileSpreadsheet, FileCheck,
} from "lucide-react";
import { getAtas, updateAta, deleteAta, type Ata } from "../../../lib/api/atasService";
import { uploadAtaFile } from "../../../lib/api/storageService";
import { getCategorias, type Categoria } from "../../../lib/api/categoriasService";
import { logAtividade } from "../../../lib/api/atividadesService";
import type { Usuario } from "../../../lib/api/usuarioService";

const TIPOS = ["Estatuto", "Financeiro", "Atas"];

type ModalMode = "edit" | null;

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

const STATUS_OPTIONS = ["Todos", "Publicado", "Rascunho", "Arquivado"];
type SortField = "numero" | "data";

export function AdminAtas() {
  const navigate = useNavigate();
  const { usuario } = useOutletContext<{ usuario: Usuario | null }>();
  const isViewer = usuario?.role === "viewer";
  const [atas, setAtas] = useState<Ata[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasLoading, setCategoriasLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState("Todas");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterYear, setFilterYear] = useState("Todos");
  const [sortField, setSortField] = useState<SortField>("numero");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState(10);

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

  const availableYears = useMemo(
    () => [...new Set(atas.map((a) => a.data?.slice(0, 4)).filter(Boolean))].sort().reverse(),
    [atas]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const processedAtas = useMemo(() => {
    const q = query.toLowerCase();
    return atas
      .filter((a) => {
        const catIds = toArray((a as any).categoria_id);
        const matchesCat = filterCat === "Todas" || catIds.some((id) => categoriaMap[id]?.name === filterCat);
        const matchesStatus = filterStatus === "Todos" || a.status === filterStatus;
        const matchesYear = filterYear === "Todos" || a.data?.slice(0, 4) === filterYear;
        const matchesQuery = a.titulo.toLowerCase().includes(q) || a.numero.toLowerCase().includes(q);
        return matchesCat && matchesStatus && matchesYear && matchesQuery;
      })
      .sort((a, b) => {
        const comparison = sortField === "numero" ? a.numero.localeCompare(b.numero) : a.data.localeCompare(b.data);
        return sortOrder === "desc" ? -comparison : comparison;
      });
  }, [atas, query, filterCat, filterStatus, filterYear, sortField, sortOrder, categoriaMap]);

  function categoriasLabel(ata: Ata) {
    const ids = toArray((ata as any).categoria_id);
    if (ids.length === 0) return "Geral";
    return ids.map((id) => categoriaMap[id]?.name).filter(Boolean).join(", ") || "Geral";
  }

  function handleExportExcel() {
    const header = ["Nº da Ata", "Título", "Categoria", "Responsável", "Data", "Status"];
    const rows = processedAtas.map((a) => [
      a.numero, a.titulo, categoriasLabel(a), a.presidente, formatDate(a.data), a.status,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    ws["!cols"] = header.map((h, col) => {
      const maxLen = Math.max(h.length, ...rows.map((r) => String(r[col] ?? "").length));
      return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
    });

    const border = {
      top: { style: "thin", color: { rgb: "D1D5DB" } },
      bottom: { style: "thin", color: { rgb: "D1D5DB" } },
      left: { style: "thin", color: { rgb: "D1D5DB" } },
      right: { style: "thin", color: { rgb: "D1D5DB" } },
    };
    const range = XLSX.utils.decode_range(ws["!ref"] as string);
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (!cell) continue;
        cell.s = R === 0
          ? { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "0F172A" } }, alignment: { horizontal: "left", vertical: "center" }, border }
          : { border, alignment: { vertical: "center" } };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Atas");
    XLSX.writeFile(wb, `atas_${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  function handleExportPDF() {
    const esc = (s: string) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));
    const dataEmissao = new Date().toLocaleString("pt-BR");
    const rowsHtml = processedAtas.map((a) => `<tr>
        <td>${esc(a.numero)}</td><td>${esc(a.titulo)}</td><td>${esc(categoriasLabel(a))}</td>
        <td>${esc(a.presidente)}</td><td>${esc(formatDate(a.data))}</td><td>${esc(a.status)}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8" /><title>Atas</title>
<style>
  * { box-sizing: border-box; } body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; margin: 40px; }
  .header h1 { font-size: 24px; font-weight: 800; margin: 0; color: #0f172a; }
  .header .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
  .divider { height: 3px; background: linear-gradient(90deg, #2563eb, #93c5fd); border: none; margin: 18px 0 24px; border-radius: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  thead th { background: #0f172a; color: #fff; text-align: left; padding: 10px 12px; text-transform: uppercase; font-size: 10px; }
  tbody td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  @media print { body { margin: 12mm; } thead th, tbody tr:nth-child(even) { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>
  <div class="header"><h1>Gestão de Atas</h1><div class="sub">Emitido em ${esc(dataEmissao)}</div></div>
  <hr class="divider" />
  <table><thead><tr><th>Nº da Ata</th><th>Título</th><th>Categoria</th><th>Responsável</th><th>Data</th><th>Status</th></tr></thead>
  <tbody>${rowsHtml}</tbody></table>
  <div class="footer">Documento gerado pelo Sistema de Gestão de Atas</div>
</body></html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  const openEdit = (ata: Ata) => {
    if (isViewer) return;
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

  const handleParticipanteInputChange = (value: string) => {
    if (value.includes(",")) {
      const parts = value.split(",");
      const novosNomes = parts.slice(0, -1).map((p) => p.trim()).filter(Boolean);
      if (novosNomes.length) {
        setForm((prev) => ({ ...prev, participantes: [...prev.participantes, ...novosNomes] }));
      }
      setParticipanteInput(parts[parts.length - 1]);
    } else {
      setParticipanteInput(value);
    }
  };

  const handleParticipanteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && participanteInput.trim()) {
      e.preventDefault();
      setForm((prev) => ({ ...prev, participantes: [...prev.participantes, participanteInput.trim()] }));
      setParticipanteInput("");
    }
    if (e.key === "Backspace" && !participanteInput && form.participantes.length) {
      setForm((prev) => ({ ...prev, participantes: prev.participantes.slice(0, -1) }));
    }
  };

  const removeParticipante = (idx: number) => {
    setForm((prev) => ({ ...prev, participantes: prev.participantes.filter((_, i) => i !== idx) }));
  };

  const saveForm = async () => {
    if (!form.numero || !form.titulo || !form.data) return;
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
      local: form.local,
      presidente: form.presidente,
      secretario: form.secretario,
      participantes: form.participantes,
      arquivos,
      status: form.status,
    } as any;

    if (editingId) {
      const { data, error } = await updateAta(editingId, payload);
      if (!error && data) {
        setAtas((prev) => prev.map((a) => (a.id === editingId ? data : a)));
        logAtividade("editou uma ata", data.titulo);
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
    if (!deletingId || isViewer) return;
    const deletingAta = atas.find((a) => a.id === deletingId);
    const { error } = await deleteAta(deletingId);
    if (!error) {
      setAtas((prev) => prev.filter((a) => a.id !== deletingId));
      logAtividade("moveu uma ata para a lixeira", deletingAta?.titulo);
    } else {
      setErrorMsg("Erro ao mover o documento para a lixeira.");
    }
    setDeletingId(null);
  };

  const handleDownload = (ata: Ata) => {
    logAtividade("realizou download de", getLatestFile(ata)?.nome ?? ata.titulo);
  };

  const viewingFile = viewingAta ? getLatestFile(viewingAta) : null;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700 }}>Portal Geral de Atas</h1>
          <p className="text-gray-400 text-sm mt-1">Consulte, exporte e edite documentos e atas registradas</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all"
            title="Exportar para Excel"
          >
            <FileSpreadsheet size={16} /> <span className="hidden md:inline">Exportar Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-100 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-all"
            title="Exportar relatório em PDF"
          >
            <FileCheck size={16} /> <span className="hidden md:inline">Exportar PDF</span>
          </button>
          {!isViewer && (
            <button
              onClick={() => navigate("/admin/atas/nova")}
              className="btn-primary flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold shrink-0"
            >
              <Plus size={16} /> Criar Nova Ata
            </button>
          )}
        </div>
      </div>

      {/* Search + filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquise por número da ata, título ou palavras presentes no conteúdo..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Filtrar Categoria</label>
            <div className="relative">
              <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                {["Todas", ...categorias.map((c) => c.name)].map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Filtrar Status</label>
            <div className="relative">
              <FileCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Filtrar Período (Ano)</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="Todos">Sempre</option>
                {availableYears.map((year) => <option key={year} value={year}>Ano {year}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{errorMsg}</div>
      )}

      {loading ? (
        <div className="py-16 flex items-center justify-center gap-2 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 size={16} className="animate-spin" /> Carregando atas...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase tracking-widest text-[10px] font-bold border-b border-gray-100">
                  <th className="py-4 px-6 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort("numero")}>
                    <div className="flex items-center gap-1.5">Nº da Ata <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-6">Título do Documento</th>
                  <th className="py-4 px-6">Categoria</th>
                  <th className="py-4 px-6">Responsável Presidente</th>
                  <th className="py-4 px-6 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort("data")}>
                    <div className="flex items-center gap-1.5">Data <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {processedAtas.map((ata) => {
                  const deps = toArray((ata as any).categoria_id);
                  return (
                    <tr key={ata.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-900">{ata.numero}</td>
                      <td className="py-4 px-6 text-gray-600 max-w-[240px]">{ata.titulo}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {deps.length === 0 ? (
                            <span className="text-gray-300 text-xs">Geral</span>
                          ) : (
                            deps.map((id) => {
                              const cat = categoriaMap[id];
                              if (!cat) return null;
                              return (
                                <span key={id} className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                                  {cat.name}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-500">{ata.presidente || "-"}</td>
                      <td className="py-4 px-6 text-gray-500">{formatDate(ata.data)}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          ata.status === "Publicado" ? "bg-emerald-50 text-emerald-700" : ata.status === "Arquivado" ? "bg-gray-100 text-gray-500" : "bg-amber-50 text-amber-700"
                        }`}>
                          {ata.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openView(ata)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Visualizar"><Eye size={14} /></button>
                          {!isViewer && (
                            <>
                              <button onClick={() => openEdit(ata)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Editar"><Pencil size={14} /></button>
                              <button onClick={() => setDeletingId(ata.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Excluir"><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {processedAtas.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400 text-sm">Nenhuma ata encontrada para os filtros selecionados.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3 p-4">
            {processedAtas.map((ata) => {
              const deps = toArray((ata as any).categoria_id);
              return (
                <div key={ata.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-gray-700 text-xs font-semibold truncate">{ata.numero}</p>
                      <p className="text-gray-800 text-sm font-medium mt-0.5 truncate">{ata.titulo}</p>
                    </div>
                    <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      ata.status === "Publicado" ? "bg-emerald-50 text-emerald-700" : ata.status === "Arquivado" ? "bg-gray-100 text-gray-500" : "bg-amber-50 text-amber-700"
                    }`}>
                      {ata.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1">Presidente: {ata.presidente || "-"}</p>
                  <p className="text-gray-400 text-xs mb-2">{formatDate(ata.data)}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {deps.length === 0 ? (
                      <span className="text-gray-300 text-xs">Sem categoria</span>
                    ) : (
                      deps.map((id) => {
                        const cat = categoriaMap[id];
                        if (!cat) return null;
                        return (
                          <span key={id} className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                            {cat.name}
                          </span>
                        );
                      })
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-50">
                    <button onClick={() => openView(ata)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><Eye size={15} /></button>
                    {!isViewer && (
                      <>
                        <button onClick={() => openEdit(ata)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => setDeletingId(ata.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {processedAtas.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm">Nenhuma ata encontrada para os filtros selecionados.</div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 font-medium">
              Exibindo {Math.min(processedAtas.length, pageSize)} do total de {processedAtas.length} registros filtrados
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Página:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                  className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus:outline-none"
                >
                  <option value={10}>10 registros</option>
                  <option value={25}>25 registros</option>
                  <option value={50}>50 registros</option>
                  <option value={100}>100 registros</option>
                </select>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <button disabled className="p-1.5 border border-gray-200 rounded-md text-gray-300 cursor-not-allowed">&lt;</button>
                <button className="w-7 h-7 bg-gray-900 text-white flex items-center justify-center rounded-md font-bold">1</button>
                <button disabled className="p-1.5 border border-gray-200 rounded-md text-gray-300 cursor-not-allowed">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 shrink-0">
              <h2 style={{ color: "#111827", fontWeight: 700 }}>
                Editar Ata
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 overflow-y-auto flex-1">
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

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Presidente</label>
                <input
                  value={form.presidente}
                  onChange={(e) => setForm({ ...form, presidente: e.target.value })}
                  placeholder="Nome do presidente"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
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

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoria</label>
                {categoriasLoading ? (
                  <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                    <Loader2 size={13} className="animate-spin" />
                    Carregando categorias...
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={form.categoria_id[0] ?? ""}
                      onChange={(e) => setForm({ ...form, categoria_id: e.target.value ? [e.target.value] : [] })}
                      className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                      <option value="">Selecione uma categoria...</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
                className="btn-primary flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                style={saved ? { backgroundColor: "#15803D" } : undefined}
              >
                {submitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : saved ? (
                  <><Check size={15} /> Salvo!</>
                ) : "Salvar alterações"}
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
                    onClick={() => handleDownload(viewingAta)}
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
                <iframe src={viewingFile.url} title={`PDF de ${viewingAta.titulo}`} className="w-full h-full" style={{ border: "none" }} />
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
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-amber-500" />
            </div>
            <h3 style={{ color: "#111827", fontWeight: 700, fontSize: "1rem" }} className="mb-2">Mover para a Lixeira?</h3>
            <p className="text-gray-400 text-sm mb-6">O documento continuará disponível para recuperação ou exclusão definitiva na tela de Lixeira.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors">
                Mover para o Lixo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
