import { useState } from "react";
import { Plus, Search, ChevronDown, Eye, Pencil, Trash2, X, Upload, Check } from "lucide-react";

const INITIAL_ATAS = [
  { id: "ATA - 0001/2026.001", title: "Ata da Assembleia Geral Ordinária", category: "Atas", date: "02/01/2026", status: "Publicado" },
  { id: "ATA - 0002/2026.002", title: "Balanço Patrimonial – Exercício 2025", category: "Financeiro", date: "15/01/2026", status: "Publicado" },
  { id: "ATA - 0003/2026.003", title: "Estatuto Social Consolidado", category: "Estatuto", date: "20/01/2026", status: "Publicado" },
  { id: "ATA - 0004/2026.004", title: "Ata da Reunião do Conselho de Administração", category: "Atas", date: "03/02/2026", status: "Publicado" },
  { id: "ATA - 0005/2026.005", title: "Demonstrações Financeiras – 1º Trimestre", category: "Financeiro", date: "10/02/2026", status: "Publicado" },
  { id: "ATA - 0006/2026.006", title: "Ata da Assembleia Extraordinária", category: "Atas", date: "18/02/2026", status: "Rascunho" },
  { id: "ATA - 0007/2026.007", title: "Alteração do Estatuto Social – Art. 12", category: "Estatuto", date: "25/02/2026", status: "Publicado" },
  { id: "ATA - 0008/2026.008", title: "Relatório de Gestão Financeira", category: "Financeiro", date: "05/03/2026", status: "Publicado" },
  { id: "ATA - 0009/2026.009", title: "Ata da Reunião Ordinária – Março", category: "Atas", date: "12/03/2026", status: "Publicado" },
  { id: "ATA - 0010/2026.010", title: "Fluxo de Caixa – 1º Bimestre 2026", category: "Financeiro", date: "20/03/2026", status: "Rascunho" },
];

const CATEGORIES = ["Atas", "Financeiro", "Estatuto"];

const catStyle: Record<string, { bg: string; text: string }> = {
  Atas:       { bg: "#EFF6FF", text: "#1D4ED8" },
  Financeiro: { bg: "#F0FDF4", text: "#15803D" },
  Estatuto:   { bg: "#FDF4FF", text: "#7E22CE" },
};

type Ata = { id: string; title: string; category: string; date: string; status: string };
type ModalMode = "add" | "edit" | null;

const emptyForm = { id: "", title: "", category: "Atas", date: "", status: "Publicado" };

export function AdminAtas() {
  const [atas, setAtas] = useState<Ata[]>(INITIAL_ATAS);
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState("Todas");
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState(emptyForm);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const filtered = atas.filter((a) => {
    const q = query.toLowerCase();
    return (
      (filterCat === "Todas" || a.category === filterCat) &&
      (a.title.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
    );
  });

  const openAdd = () => { setForm(emptyForm); setModal("add"); setEditIndex(null); };
  const openEdit = (i: number) => {
    const real = atas.indexOf(filtered[i]);
    setForm({ ...atas[real] });
    setEditIndex(real);
    setModal("edit");
  };
  const closeModal = () => { setModal(null); setForm(emptyForm); setEditIndex(null); };

  const saveForm = () => {
    if (!form.title || !form.date || !form.id) return;
    if (modal === "add") {
      setAtas((prev) => [form, ...prev]);
    } else if (modal === "edit" && editIndex !== null) {
      setAtas((prev) => prev.map((a, i) => (i === editIndex ? form : a)));
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); closeModal(); }, 700);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      setAtas((prev) => prev.filter((_, i) => i !== deleteIndex));
      setDeleteIndex(null);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700 }}>Gerenciar Atas</h1>
          <p className="text-gray-400 text-sm mt-1">Adicione, edite, categorize ou exclua documentos</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 text-white text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#111827" }}
        >
          <Plus size={16} />
          Nova Ata
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
            {["Todas", ...CATEGORIES].map((c) => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-3.5 border-b border-gray-100 bg-gray-50">
          <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nº da ATA</div>
          <div className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Título</div>
          <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</div>
          <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</div>
          <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</div>
          <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Ações</div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">Nenhum documento encontrado.</div>
        ) : (
          filtered.map((ata, i) => {
            const cs = catStyle[ata.category] ?? { bg: "#F3F4F6", text: "#374151" };
            const realIdx = atas.indexOf(ata);
            return (
              <div key={i} className="grid grid-cols-12 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors items-center">
                <div className="col-span-3 text-gray-700 text-xs font-medium">{ata.id}</div>
                <div className="col-span-4 text-gray-600 text-sm truncate pr-4">{ata.title}</div>
                <div className="col-span-2">
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: cs.bg, color: cs.text }}>
                    {ata.category}
                  </span>
                </div>
                <div className="col-span-1 text-gray-500 text-xs">{ata.date}</div>
                <div className="col-span-1">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ata.status === "Publicado" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {ata.status}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Visualizar">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => openEdit(i)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDeleteIndex(realIdx)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Excluir">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <p className="text-gray-400 text-xs mt-3 text-right">{filtered.length} documento{filtered.length !== 1 ? "s" : ""}</p>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 style={{ color: "#111827", fontWeight: 700 }}>
                {modal === "add" ? "Nova Ata" : "Editar Ata"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nº da ATA</label>
                <input
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="ATA - 0001/2026.001"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Ata da Assembleia Geral Ordinária"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoria</label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none"
                    >
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Data</label>
                  <input
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <div className="flex gap-3">
                  {["Publicado", "Rascunho"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all"
                      style={form.status === s
                        ? { backgroundColor: "#111827", color: "#fff", borderColor: "#111827" }
                        : { backgroundColor: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* File upload area */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Arquivo (PDF)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center gap-2 text-center cursor-pointer hover:border-gray-300 transition-colors">
                  <Upload size={20} className="text-gray-400" />
                  <p className="text-gray-500 text-xs font-medium">Clique para selecionar ou arraste o PDF</p>
                  <p className="text-gray-300 text-xs">Tamanho máximo: 10 MB</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={saveForm}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all"
                style={{ backgroundColor: saved ? "#15803D" : "#111827" }}
              >
                {saved ? <><Check size={15} /> Salvo!</> : modal === "add" ? "Adicionar" : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteIndex !== null && (
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
              <button onClick={() => setDeleteIndex(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
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
