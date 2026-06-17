import { useState } from "react";
import { BarChart2, FileText, Gavel, Pencil, Trash2, Plus, X, Check } from "lucide-react";

const ICONS = ["BarChart2", "FileText", "Gavel"];

const iconMap: Record<string, React.ReactNode> = {
  BarChart2: <BarChart2 size={22} />,
  FileText:  <FileText size={22} />,
  Gavel:     <Gavel size={22} />,
};

type Category = { name: string; description: string; icon: string; count: number; color: string };

const INITIAL: Category[] = [
  { name: "Financeiro", description: "Documentos e registros financeiros", icon: "BarChart2", count: 7, color: "#15803D" },
  { name: "Atas",       description: "Atas de reuniões e assembleias",      icon: "FileText",  count: 8, color: "#1D4ED8" },
  { name: "Estatuto",   description: "Estatuto e normas institucionais",     icon: "Gavel",     count: 3, color: "#7E22CE" },
];

const emptyForm: Category = { name: "", description: "", icon: "FileText", count: 0, color: "#111827" };

export function AdminCategories() {
  const [cats, setCats] = useState<Category[]>(INITIAL);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState<Category>(emptyForm);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const openAdd = () => { setForm(emptyForm); setModal("add"); setEditIdx(null); };
  const openEdit = (i: number) => { setForm({ ...cats[i] }); setEditIdx(i); setModal("edit"); };
  const close = () => { setModal(null); setForm(emptyForm); setEditIdx(null); };

  const save = () => {
    if (!form.name) return;
    if (modal === "add") setCats((p) => [...p, { ...form, count: 0 }]);
    else if (modal === "edit" && editIdx !== null) setCats((p) => p.map((c, i) => i === editIdx ? form : c));
    setSaved(true);
    setTimeout(() => { setSaved(false); close(); }, 700);
  };

  const confirmDelete = () => {
    if (deleteIdx !== null) { setCats((p) => p.filter((_, i) => i !== deleteIdx)); setDeleteIdx(null); }
  };

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700 }}>Categorias</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie as categorias de classificação dos documentos</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 text-white text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#111827" }}
        >
          <Plus size={16} />
          Nova Categoria
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {cats.map((cat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                {iconMap[cat.icon] ?? <FileText size={22} />}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(i)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteIdx(i)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h3 style={{ color: "#111827", fontWeight: 700 }} className="mb-1">{cat.name}</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">{cat.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-gray-400 text-xs">Documentos</span>
              <span className="font-bold text-sm" style={{ color: cat.color }}>{cat.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Info table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p style={{ color: "#111827", fontWeight: 600, fontSize: "0.9rem" }}>Resumo por categoria</p>
        </div>
        <div className="grid grid-cols-4 px-6 py-3 border-b border-gray-100 bg-gray-50">
          {["Categoria", "Descrição", "Documentos", "Participação"].map((h) => (
            <p key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</p>
          ))}
        </div>
        {cats.map((cat, i) => {
          const total = cats.reduce((s, c) => s + c.count, 0);
          const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
          return (
            <div key={i} className="grid grid-cols-4 px-6 py-4 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                  {iconMap[cat.icon] ? <span style={{ transform: "scale(0.7)", display: "flex" }}>{iconMap[cat.icon]}</span> : null}
                </div>
                <span className="text-gray-800 text-sm font-medium">{cat.name}</span>
              </div>
              <span className="text-gray-400 text-sm">{cat.description}</span>
              <span className="text-gray-700 text-sm font-semibold">{cat.count}</span>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-24">
                  <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                </div>
                <span className="text-gray-500 text-xs">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 style={{ color: "#111827", fontWeight: 700 }}>{modal === "add" ? "Nova Categoria" : "Editar Categoria"}</h2>
              <button onClick={close} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Financeiro"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descrição</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Documentos e registros financeiros"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ícone</label>
                <div className="flex gap-3">
                  {ICONS.map((ic) => (
                    <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
                      className="flex-1 h-12 rounded-xl border flex items-center justify-center transition-all"
                      style={form.icon === ic ? { borderColor: "#111827", backgroundColor: "#111827", color: "#fff" } : { borderColor: "#E5E7EB", color: "#9CA3AF" }}>
                      {iconMap[ic]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cor de destaque</label>
                <div className="flex gap-2">
                  {["#15803D", "#1D4ED8", "#7E22CE", "#B45309", "#DC2626", "#111827"].map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      className="w-8 h-8 rounded-full border-2 transition-all"
                      style={{ backgroundColor: c, borderColor: form.color === c ? "#111827" : "transparent", transform: form.color === c ? "scale(1.2)" : "scale(1)" }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={close} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={save}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all"
                style={{ backgroundColor: saved ? "#15803D" : "#111827" }}>
                {saved ? <><Check size={15} /> Salvo!</> : modal === "add" ? "Criar" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 style={{ color: "#111827", fontWeight: 700, fontSize: "1rem" }} className="mb-2">Excluir categoria?</h3>
            <p className="text-gray-400 text-sm mb-6">Os documentos desta categoria não serão excluídos, mas ficarão sem classificação.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteIdx(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
