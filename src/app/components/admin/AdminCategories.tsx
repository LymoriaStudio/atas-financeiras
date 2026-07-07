import { useEffect, useState } from "react";
import {
  BarChart2, FileText, Gavel, Users, Building2, Calendar, Briefcase,
  Landmark, ClipboardList, Scale, Shield, Archive, BookOpen, DollarSign,
  TrendingUp, Star, Pencil, Trash2, Plus, Check, Loader2,
} from "lucide-react";
import {
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  type Categoria,
} from "../../../lib/api/categoriasService";
import { getAtas, type Ata } from "../../../lib/api/atasService";
import { logAtividade } from "../../../lib/api/atividadesService";

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
  const [cats, setCats] = useState<Categoria[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [atas, setAtas] = useState<Ata[]>([]);
  const [atasLoading, setAtasLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<FormState>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true); setErrorMsg(null);
    const { data, error } = await createCategoria({
      name: form.name,
      description: form.description,
      icon: form.icon,
      color: form.color,
      count: 0,
    });
    if (!error && data) {
      setCats((prev) => [data, ...prev]);
      setForm(emptyForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
      logAtividade("criou uma categoria", data.name);
    } else {
      setErrorMsg("Erro ao criar categoria.");
    }
    setSubmitting(false);
  };

  const startEdit = (cat: Categoria) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, description: cat.description, icon: cat.icon, color: cat.color });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm(emptyForm); };

  const saveEdit = async () => {
    if (!editingId || !editForm.name.trim()) return;
    const { data, error } = await updateCategoria(editingId, editForm);
    if (!error && data) {
      setCats((prev) => prev.map((c) => (c.id === editingId ? data : c)));
      logAtividade("editou uma categoria", data.name);
      cancelEdit();
    } else {
      setErrorMsg("Erro ao salvar alterações.");
    }
  };

  const handleDelete = async (cat: Categoria) => {
    if (!confirm(`Deseja realmente excluir a categoria "${cat.name}"?`)) return;
    const { error } = await deleteCategoria(cat.id);
    if (!error) {
      setCats((prev) => prev.filter((c) => c.id !== cat.id));
      logAtividade("excluiu uma categoria", cat.name);
    } else {
      setErrorMsg("Erro ao excluir categoria.");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h1 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700 }}>Categorias</h1>
        <p className="text-gray-400 text-sm mt-1">Defina classificações, cores e ícones para organizar os documentos</p>
      </div>

      {errorMsg && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{errorMsg}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Cadastrar */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
          <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Plus size={16} className="text-blue-600" /> Cadastrar Categoria
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Nome</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Financeiro"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-lg text-sm text-gray-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Descrição</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Quais documentos pertencem a esta categoria..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-lg text-sm text-gray-700 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Ícone</label>
              <div className="grid grid-cols-8 gap-1.5">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setForm({ ...form, icon: ic })}
                    title={ic}
                    className="h-8 rounded-lg border flex items-center justify-center transition-all"
                    style={form.icon === ic
                      ? { borderColor: form.color, backgroundColor: `${form.color}15`, color: form.color }
                      : { borderColor: "#E5E7EB", color: "#9CA3AF" }}
                  >
                    <span style={{ transform: "scale(0.65)", display: "flex" }}>{iconMap[ic]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cor de destaque</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    title={c}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: c,
                      boxShadow: form.color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                      transform: form.color === c ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {form.color === c && <Check size={13} className="text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: saved ? "#15803D" : "#111827" }}
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : saved ? <><Check size={15} /> Criada!</> : "Registrar Categoria"}
            </button>
          </form>
        </div>

        {/* Coluna 2: Lista */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 pb-4 border-b border-gray-50">
            <h4 className="text-base font-bold text-gray-900">Categorias Cadastradas</h4>
            <p className="text-xs text-gray-400 mt-1">Quantidade de atas vinculadas por categoria</p>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center gap-2 text-gray-400 text-sm">
              <Loader2 size={16} className="animate-spin" /> Carregando categorias...
            </div>
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
                  {cats.map((cat) => {
                    const isEditing = editingId === cat.id;
                    const count = categoriaCounts[cat.id] ?? 0;
                    return (
                      <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-6">
                          {isEditing ? (
                            <div className="space-y-2 min-w-[160px]">
                              <input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                              />
                              <div className="flex gap-1.5">
                                {COLORS.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => setEditForm({ ...editForm, color: c })}
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: c, boxShadow: editForm.color === c ? "0 0 0 2px #111827" : "none" }}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                                {iconMap[cat.icon] ? <span style={{ transform: "scale(0.7)", display: "flex" }}>{iconMap[cat.icon]}</span> : null}
                              </div>
                              <span className="font-medium text-gray-800">{cat.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-gray-500 max-w-[220px]">
                          {isEditing ? (
                            <input
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                            />
                          ) : (
                            cat.description || <span className="text-gray-300 italic">Sem descrição</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-gray-400 whitespace-nowrap">{formatDate(cat.created_at)}</td>
                        <td className="py-3.5 px-6">
                          <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-semibold">{count} atas</span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={saveEdit} className="px-3 py-1.5 bg-gray-900 hover:opacity-90 text-white text-xs font-semibold rounded-lg">Salvar</button>
                              <button onClick={cancelEdit} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg">Cancelar</button>
                            </div>
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
                  {cats.length === 0 && (
                    <tr><td colSpan={5} className="py-12 text-center text-gray-400 text-sm">Nenhuma categoria cadastrada ainda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
