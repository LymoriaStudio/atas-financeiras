import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  BarChart2, FileText, Gavel, Users, Building2, Calendar, Briefcase,
  Landmark, ClipboardList, Scale, Shield, Archive, BookOpen, DollarSign,
  TrendingUp, Star, Pencil, Trash2, Plus, Search, ChevronDown, Settings,
  X, Check, Loader2,
} from "lucide-react";
import {
  getCategorias, updateCategoria, deleteCategoria,
  type Categoria,
} from "../../../lib/api/categoriasService";
import { getAtas, type Ata } from "../../../lib/api/atasService";
import { logAtividade } from "../../../lib/api/atividadesService";
import type { Usuario } from "../../../lib/api/usuarioService";
import { useCachedResource } from "../../../lib/useCachedResource";
import { LoadingSpinner } from "../LoadingSpinner";

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

function formatDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function AdminCategories() {
  const navigate = useNavigate();
  const { usuario } = useOutletContext<{ usuario: Usuario | null }>();
  const isViewer = usuario?.role === "viewer";
  const { data: catsData, loading: catsLoading, error: catsError, setData: setCats } = useCachedResource<Categoria[]>("categorias", getCategorias);
  const { data: atasData, loading: atasLoading } = useCachedResource<Ata[]>("atas", getAtas);
  const cats = catsData ?? [];
  const atas = atasData ?? [];
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fetchError = catsError ? "Não foi possível carregar as categorias. Tente novamente." : null;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"mais-recente" | "mais-antiga" | "mais-atas" | "menos-atas">("mais-recente");

  const loading = catsLoading || atasLoading;

  const categoriaCounts: Record<string, number> = {};
  atas.forEach((ata) => {
    toArray((ata as any).categoria_id).forEach((id) => {
      categoriaCounts[id] = (categoriaCounts[id] ?? 0) + 1;
    });
  });

  const filteredCats = useMemo(() => {
    const q = query.toLowerCase();
    return [...cats]
      .filter((c) =>
        q === "" ||
        c.name.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (sortBy === "mais-atas") return (categoriaCounts[b.id] ?? 0) - (categoriaCounts[a.id] ?? 0);
        if (sortBy === "menos-atas") return (categoriaCounts[a.id] ?? 0) - (categoriaCounts[b.id] ?? 0);
        const dateA = new Date(a.created_at ?? 0).getTime();
        const dateB = new Date(b.created_at ?? 0).getTime();
        return sortBy === "mais-antiga" ? dateA - dateB : dateB - dateA;
      });
  }, [cats, query, sortBy, categoriaCounts]);

  const startEdit = (cat: Categoria) => {
    if (isViewer) return;
    setEditingId(cat.id);
    setEditForm({ name: cat.name, description: cat.description, icon: cat.icon, color: cat.color });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
    setSaved(false);
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.name.trim() || isViewer) return;
    setSubmitting(true);
    setErrorMsg(null);
    const { data, error } = await updateCategoria(editingId, editForm);
    if (!error && data) {
      setCats((prev) => (prev ?? []).map((c) => (c.id === editingId ? data : c)));
      logAtividade("editou uma categoria", data.name);
      setSubmitting(false);
      setSaved(true);
      setTimeout(cancelEdit, 700);
    } else {
      setErrorMsg("Erro ao salvar alterações.");
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Categoria) => {
    if (isViewer) return;
    if (!confirm(`Deseja realmente excluir a categoria "${cat.name}"?`)) return;
    const { error } = await deleteCategoria(cat.id);
    if (!error) {
      setCats((prev) => (prev ?? []).filter((c) => c.id !== cat.id));
      logAtividade("excluiu uma categoria", cat.name);
    } else {
      setErrorMsg("Erro ao excluir categoria.");
    }
  };

  return (
    <div className="p-4 space-y-6">
      {(errorMsg || fetchError) && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{errorMsg ?? fetchError}</div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative w-full sm:w-64 shrink-0">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou descrição..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
        <div className="relative w-full sm:w-56 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <option value="mais-recente">Ordenar por: Mais recente</option>
            <option value="mais-antiga">Ordenar por: Mais antiga</option>
            <option value="mais-atas">Ordenar por: Mais atas</option>
            <option value="menos-atas">Ordenar por: Menos atas</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {!isViewer && (
          <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
            <button
              onClick={() => navigate("/admin/categorias/vitrine")}
              title="Configurar vitrine do site"
              className="w-[42px] h-[42px] flex items-center justify-center border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={() => navigate("/admin/categorias/nova")}
              className="btn-primary flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold"
            >
              <Plus size={16} /> Nova Categoria
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 pb-4 border-b border-gray-50">
          <h4 className="text-base font-bold text-gray-900">Categorias Cadastradas</h4>
          <p className="text-xs text-gray-400 mt-1">Quantidade de atas vinculadas por categoria</p>
        </div>

        {loading ? (
            <LoadingSpinner label="Carregando categorias..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 uppercase tracking-widest text-[10px] font-bold border-b border-gray-100">
                    <th className="py-3.5 px-6">Categoria</th>
                    <th className="py-3.5 px-6">Descrição</th>
                    <th className="py-3.5 px-6">Criada em</th>
                    <th className="py-3.5 px-6">Atas vinculadas</th>
                    <th className="py-3.5 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {filteredCats.map((cat) => {
                    const count = categoriaCounts[cat.id] ?? 0;
                    return (
                      <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                              {iconMap[cat.icon] ? <span style={{ transform: "scale(0.7)", display: "flex" }}>{iconMap[cat.icon]}</span> : null}
                            </div>
                            <span className="font-medium text-gray-800">{cat.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-gray-500 max-w-[220px]">
                          {cat.description || <span className="text-gray-300 italic">Sem descrição</span>}
                        </td>
                        <td className="py-3.5 px-6 text-gray-400 whitespace-nowrap">{formatDate(cat.created_at)}</td>
                        <td className="py-3.5 px-6">
                          <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-semibold">{count} atas</span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          {isViewer ? (
                            <span className="text-gray-300 text-xs">—</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => startEdit(cat)} title="Editar" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><Pencil size={14} /></button>
                              <button onClick={() => handleDelete(cat)} title="Excluir" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCats.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                        {cats.length === 0 ? "Nenhuma categoria cadastrada ainda." : "Nenhuma categoria encontrada para os filtros selecionados."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Modal de edição */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 shrink-0">
              <h2 style={{ color: "#111827", fontWeight: 700 }}>Editar Categoria</h2>
              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Ex: Financeiro"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descrição</label>
                <input
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Breve descrição da categoria..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Ícone</label>
                <div className="grid grid-cols-8 gap-1.5">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, icon: ic })}
                      title={ic}
                      className="h-9 rounded-lg border flex items-center justify-center transition-all cursor-pointer"
                      style={editForm.icon === ic
                        ? { borderColor: editForm.color, backgroundColor: `${editForm.color}15`, color: editForm.color }
                        : { borderColor: "#E5E7EB", color: "#9CA3AF" }}
                    >
                      <span style={{ transform: "scale(0.7)", display: "flex" }}>{iconMap[ic]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Cor de destaque</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, color: c })}
                      title={c}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
                      style={{
                        backgroundColor: c,
                        boxShadow: editForm.color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                        transform: editForm.color === c ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      {editForm.color === c && <Check size={13} className="text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-100 shrink-0">
              <button onClick={cancelEdit} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                disabled={submitting}
                className="btn-primary flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                style={saved ? { backgroundColor: "#15803D" } : undefined}
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : saved ? <><Check size={15} /> Salvo!</> : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
