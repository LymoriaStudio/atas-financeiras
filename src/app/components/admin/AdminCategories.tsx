import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import {
  BarChart2, FileText, Gavel, Users, Building2, Calendar, Briefcase,
  Landmark, ClipboardList, Scale, Shield, Archive, BookOpen, DollarSign,
  TrendingUp, Star, Pencil, Trash2, Plus, X, Check, Loader2, Eye,
  MoreHorizontal,
} from "lucide-react";
import {
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  type Categoria,
} from "../../../lib/api/categoriasService";
import { getAtas, type Ata } from "../../../lib/api/atasService";

const ICONS = [
  "BarChart2","FileText","Gavel","Users","Building2","Calendar",
  "Briefcase","Landmark","ClipboardList","Scale","Shield","Archive",
  "BookOpen","DollarSign","TrendingUp","Star",
];

const iconMap: Record<string, React.ReactNode> = {
  BarChart2: <BarChart2 size={22} />, FileText: <FileText size={22} />,
  Gavel: <Gavel size={22} />, Users: <Users size={22} />,
  Building2: <Building2 size={22} />, Calendar: <Calendar size={22} />,
  Briefcase: <Briefcase size={22} />, Landmark: <Landmark size={22} />,
  ClipboardList: <ClipboardList size={22} />, Scale: <Scale size={22} />,
  Shield: <Shield size={22} />, Archive: <Archive size={22} />,
  BookOpen: <BookOpen size={22} />, DollarSign: <DollarSign size={22} />,
  TrendingUp: <TrendingUp size={22} />, Star: <Star size={22} />,
};

const COLORS = [
  "#15803D","#1D4ED8","#7E22CE","#B45309","#DC2626","#111827",
  "#0891B2","#65A30D","#C026D3","#EA580C","#0EA5E9","#475569",
];

type FormState = { name: string; description: string; icon: string; color: string };
const emptyForm: FormState = { name: "", description: "", icon: "FileText", color: "#111827" };

function toArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.length) return [raw];
  return [];
}

// ─── Portal container global (único, fora do React tree) ──────────────────────
// Criado uma vez fora de qualquer componente — nunca é removido,
// então o React nunca perde a referência ao tentar fazer removeChild.
const portalRoot = (() => {
  const el = document.createElement("div");
  el.id = "dropdown-portal";
  document.body.appendChild(el);
  return el;
})();

// ─── ActionsDropdown ──────────────────────────────────────────────────────────
function ActionsDropdown({ cat, onView, onEdit, onDelete }: {
  cat: Categoria;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  // Fecha ao desmontar (ex: categoria excluída enquanto menu está aberto)
  useEffect(() => () => setOpen(false), []);

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        aria-label="Ações"
        style={{
          width: 32, height: 32, borderRadius: 8, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "none", border: "none", cursor: "pointer", color: "#9CA3AF",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#374151"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#9CA3AF"; }}
      >
        <MoreHorizontal size={16} />
      </button>

      {open && ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: coords.top,
            right: coords.right,
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            minWidth: 148,
            overflow: "hidden",
          }}
        >
          {[
            { label: "Visualizar", icon: <Eye size={14} style={{ color: "#3B82F6" }} />, color: "#374151", hover: "#F9FAFB", action: onView },
            { label: "Editar",     icon: <Pencil size={14} style={{ color: "#6B7280" }} />, color: "#374151", hover: "#F9FAFB", action: onEdit },
          ].map(({ label, icon, color, hover, action }) => (
            <button
              key={label}
              onClick={() => { action(); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", fontSize: 14, color, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              {icon}{label}
            </button>
          ))}
          <div style={{ height: 1, background: "#F3F4F6", margin: "2px 0" }} />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", fontSize: 14, color: "#EF4444", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <Trash2 size={14} />Excluir
          </button>
        </div>,
        portalRoot  // ← container estável, nunca removido
      )}
    </>
  );
}

// ─── AdminCategories ──────────────────────────────────────────────────────────
export function AdminCategories() {
  const [cats, setCats] = useState<Categoria[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [atas, setAtas] = useState<Ata[]>([]);
  const [atasLoading, setAtasLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingCat, setViewingCat] = useState<Categoria | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchCategorias(); fetchAtas(); }, []);

  async function fetchCategorias() {
    setCatsLoading(true); setErrorMsg(null);
    const { data, error } = await getCategorias();
    if (error) setErrorMsg("Não foi possível carregar as categorias. Tente novamente.");
    else setCats(data ?? []);
    setCatsLoading(false);
  }

  async function fetchAtas() {
    setAtasLoading(true);
    const { data, error } = await getAtas();
    if (!error && data) setAtas(data);
    setAtasLoading(false);
  }

  const loading = catsLoading || atasLoading;

  const categoriaCounts: Record<string, number> = {};
  atas.forEach((ata) => {
    toArray((ata as any).categoria_id).forEach((id) => {
      categoriaCounts[id] = (categoriaCounts[id] ?? 0) + 1;
    });
  });
  const totalAtas = atas.length;

  const openAdd  = () => { setForm(emptyForm); setModal("add"); setEditingId(null); };
  const openEdit = (cat: Categoria) => {
    setForm({ name: cat.name, description: cat.description, icon: cat.icon, color: cat.color });
    setEditingId(cat.id); setModal("edit");
  };
  const openView = (cat: Categoria) => { setViewingCat(cat); setModal("view"); };
  const close    = () => { setModal(null); setForm(emptyForm); setEditingId(null); setViewingCat(null); };

  const save = async () => {
    if (!form.name) return;
    setSubmitting(true); setErrorMsg(null);
    if (modal === "add") {
      const { data, error } = await createCategoria({ ...form, count: 0 });
      if (!error && data) setCats((prev) => [data, ...prev]);
      else { setErrorMsg("Erro ao criar categoria."); setSubmitting(false); return; }
    } else if (modal === "edit" && editingId) {
      const { data, error } = await updateCategoria(editingId, form);
      if (!error && data) setCats((prev) => prev.map((c) => c.id === editingId ? data : c));
      else { setErrorMsg("Erro ao salvar alterações."); setSubmitting(false); return; }
    }
    setSubmitting(false); setSaved(true);
    setTimeout(() => { setSaved(false); close(); }, 700);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const { error } = await deleteCategoria(deletingId);
    if (!error) setCats((prev) => prev.filter((c) => c.id !== deletingId));
    else setErrorMsg("Erro ao excluir categoria.");
    setDeletingId(null);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700 }}>Categorias</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie as categorias de classificação dos documentos</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 text-white text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto shrink-0"
          style={{ backgroundColor: "#111827" }}
        >
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{errorMsg}</div>
      )}

      {loading ? (
        <div className="py-16 flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Loader2 size={16} className="animate-spin" /> Carregando categorias...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
              <colgroup>
                <col style={{ width: "25%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #F3F4F6" }}>
                  {["Categoria", "Descrição", "Documentos", "Participação"].map((h) => (
                    <th key={h} style={{ padding: "12px 24px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                  <th style={{ padding: "12px 24px", textAlign: "right", fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", position: "sticky", right: 0, background: "#F9FAFB", boxShadow: "-1px 0 0 #F3F4F6" }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {cats.map((cat) => {
                  const count = categoriaCounts[cat.id] ?? 0;
                  const pct = totalAtas > 0 ? Math.round((count / totalAtas) * 100) : 0;
                  return (
                    <tr key={cat.id} style={{ borderBottom: "1px solid #F9FAFB" }} className="hover:bg-gray-50/50 transition-colors group">
                      <td style={{ padding: "16px 24px" }}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                            {iconMap[cat.icon] ? <span style={{ transform: "scale(0.7)", display: "flex" }}>{iconMap[cat.icon]}</span> : null}
                          </div>
                          <span className="text-gray-800 text-sm font-medium truncate">{cat.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span className="text-gray-400 text-sm">{cat.description}</span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span className="text-gray-700 text-sm font-semibold">{count}</span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5" style={{ maxWidth: 96 }}>
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                          </div>
                          <span className="text-gray-500 text-xs w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", position: "sticky", right: 0, background: "white", boxShadow: "-1px 0 0 #F9FAFB" }} className="group-hover:bg-gray-50/50">
                        {/* Desktop */}
                        <div className="hidden sm:flex items-center justify-end gap-1">
                          <button onClick={() => openView(cat)} title="Visualizar" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Eye size={14} /></button>
                          <button onClick={() => openEdit(cat)} title="Editar" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => setDeletingId(cat.id)} title="Excluir" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                        {/* Mobile */}
                        <div className="sm:hidden flex justify-end">
                          <ActionsDropdown cat={cat} onView={() => openView(cat)} onEdit={() => openEdit(cat)} onDelete={() => setDeletingId(cat.id)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === "view" && viewingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ color: "#111827", fontWeight: 700 }}>Detalhes da Categoria</h2>
              <button onClick={close} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-3 mb-5 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${viewingCat.color}15`, color: viewingCat.color }}>
                {iconMap[viewingCat.icon] ?? <FileText size={22} />}
              </div>
              <div>
                <p className="font-bold text-gray-800">{viewingCat.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{viewingCat.description}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-400">Documentos</span><span className="font-semibold text-gray-800">{categoriaCounts[viewingCat.id] ?? 0}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-400">Participação</span><span className="font-semibold text-gray-800">{totalAtas > 0 ? Math.round(((categoriaCounts[viewingCat.id] ?? 0) / totalAtas) * 100) : 0}%</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-400">Slug</span><span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{viewingCat.slug}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-400">Cor</span><span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: viewingCat.color }} /><span className="font-mono text-xs text-gray-600">{viewingCat.color}</span></span></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={close} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Fechar</button>
              <button onClick={() => { close(); openEdit(viewingCat); }} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2" style={{ backgroundColor: "#111827" }}>
                <Pencil size={14} /> Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <h2 style={{ color: "#111827", fontWeight: 700 }}>{modal === "add" ? "Nova Categoria" : "Editar Categoria"}</h2>
              <button onClick={close} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Financeiro" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descrição</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Documentos e registros financeiros" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ícone</label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {ICONS.map((ic) => (
                    <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })} title={ic} className="h-10 rounded-xl border flex items-center justify-center transition-all" style={form.icon === ic ? { borderColor: "#111827", backgroundColor: "#111827", color: "#fff" } : { borderColor: "#E5E7EB", color: "#9CA3AF" }}>
                      <span style={{ transform: "scale(0.8)", display: "flex" }}>{iconMap[ic]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cor de destaque</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} title={c} className="w-8 h-8 rounded-full border-2 transition-all" style={{ backgroundColor: c, borderColor: form.color === c ? "#111827" : "transparent", transform: form.color === c ? "scale(1.2)" : "scale(1)" }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pré-visualização</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${form.color}15`, color: form.color }}>
                    {iconMap[form.icon] ?? <FileText size={20} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{form.name || "Nome da categoria"}</p>
                    <p className="text-xs text-gray-400 truncate">{form.description || "Descrição da categoria"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100 shrink-0">
              <button onClick={close} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={save} disabled={submitting} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60" style={{ backgroundColor: saved ? "#15803D" : "#111827" }}>
                {submitting ? <Loader2 size={15} className="animate-spin" /> : saved ? <><Check size={15} /> Salvo!</> : modal === "add" ? "Criar" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-500" /></div>
            <h3 style={{ color: "#111827", fontWeight: 700, fontSize: "1rem" }} className="mb-2">Excluir categoria?</h3>
            <p className="text-gray-400 text-sm mb-6">Os documentos desta categoria não serão excluídos, mas ficarão sem classificação.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}