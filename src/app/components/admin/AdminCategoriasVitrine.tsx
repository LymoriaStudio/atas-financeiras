import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { ArrowLeft, X, Plus, GripVertical, Loader2, Check, AlertCircle } from "lucide-react";
import { getCategorias, updateOrdemSite, type Categoria } from "../../../lib/api/categoriasService";
import { logAtividade } from "../../../lib/api/atividadesService";
import type { Usuario } from "../../../lib/api/usuarioService";
import { useCachedResource } from "../../../lib/useCachedResource";
import { cacheSet } from "../../../lib/apiCache";
import { categoriaIconMap } from "../../../lib/categoriaIcons";
import { LoadingSpinner } from "../LoadingSpinner";

const iconMap = categoriaIconMap(24);
const SLOT_COUNT = 3;

type Slot = Categoria | null;

export function AdminCategoriasVitrine() {
  const navigate = useNavigate();
  const { usuario } = useOutletContext<{ usuario: Usuario | null }>();

  // Viewer não configura a vitrine — redireciona de volta
  useEffect(() => {
    if (usuario && usuario.role === "viewer") {
      navigate("/admin/categorias");
    }
  }, [usuario, navigate]);

  const { data: categoriasData, loading } = useCachedResource<Categoria[]>("categorias", getCategorias);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inicializa os 3 slots com as categorias já marcadas pra aparecer no site (na ordem salva)
  useEffect(() => {
    if (categoriasData && slots === null) {
      const shown = [...categoriasData]
        .filter((c) => c.mostrar_no_site)
        .sort((a, b) => (a.ordem_site ?? 0) - (b.ordem_site ?? 0))
        .slice(0, SLOT_COUNT);
      const initial: Slot[] = Array(SLOT_COUNT).fill(null);
      shown.forEach((c, i) => { initial[i] = c; });
      setSlots(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriasData]);

  const selectedIds = new Set((slots ?? []).filter((s): s is Categoria => s !== null).map((c) => c.id));
  const filledCount = selectedIds.size;
  const hasEnoughCategorias = (categoriasData?.length ?? 0) >= SLOT_COUNT;

  const toggleCategoria = (cat: Categoria) => {
    if (!slots) return;
    const currentIdx = slots.findIndex((s) => s?.id === cat.id);
    if (currentIdx !== -1) {
      // Uncheck = mesmo efeito do X: esvazia o slot, os outros não se movem
      setSlots((prev) => (prev ?? []).map((s, i) => (i === currentIdx ? null : s)));
      return;
    }
    const emptyIdx = slots.findIndex((s) => s === null);
    if (emptyIdx === -1) return; // sem espaço — checkbox já deveria estar desabilitado
    setSlots((prev) => (prev ?? []).map((s, i) => (i === emptyIdx ? cat : s)));
  };

  const handleRemoveSlot = (idx: number) => {
    setSlots((prev) => (prev ?? []).map((s, i) => (i === idx ? null : s)));
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) { setDragIndex(null); return; }
    setSlots((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      // Se o alvo estiver vazio, o card só se move pra lá (a origem esvazia).
      // Se o alvo estiver ocupado, os dois trocam de posição. A mesma troca cobre os dois casos.
      [next[dragIndex], next[targetIndex]] = [next[targetIndex], next[dragIndex]];
      return next;
    });
    setDragIndex(null);
  };

  const handleSave = async () => {
    if (!categoriasData || !slots || filledCount !== SLOT_COUNT) return;
    setSubmitting(true);
    setErrorMsg(null);

    const rows = [
      ...slots
        .map((c, i) => ({ c, i }))
        .filter((x): x is { c: Categoria; i: number } => x.c !== null)
        .map(({ c, i }) => ({ id: c.id, mostrar_no_site: true, ordem_site: i + 1 })),
      ...categoriasData
        .filter((c) => !selectedIds.has(c.id))
        .map((c) => ({ id: c.id, mostrar_no_site: false, ordem_site: null })),
    ];

    const { error } = await updateOrdemSite(rows);
    if (error) {
      const isConflict = (error as any)?.code === "23505" || (error as any)?.code === "409";
      setErrorMsg(
        isConflict
          ? "Conflito ao salvar a ordem (duas categorias tentaram ocupar a mesma posição ao mesmo tempo). Tente novamente."
          : "Erro ao salvar a vitrine. Tente novamente."
      );
      setSubmitting(false);
      return;
    }

    // Atualiza o cache compartilhado de "categorias" com os novos valores
    const rowsById = new Map(rows.map((r) => [r.id, r]));
    const updatedCats = categoriasData.map((c) => {
      const r = rowsById.get(c.id);
      return r ? { ...c, mostrar_no_site: r.mostrar_no_site, ordem_site: r.ordem_site } : c;
    });
    cacheSet("categorias", updatedCats);

    logAtividade("configurou a vitrine de categorias do site");
    setSubmitting(false);
    setSaved(true);
    setTimeout(() => navigate("/admin/categorias"), 700);
  };

  if (usuario?.role === "viewer") return null;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={() => navigate("/admin/categorias")}
          className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200/60 rounded-xl transition-all cursor-pointer"
          title="Voltar para a listagem"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ color: "#111827", fontSize: "1.25rem", fontWeight: 700 }}>Vitrine de Categorias</h1>
          <p className="text-gray-400 text-sm mt-1">Escolha exatamente {SLOT_COUNT} categorias e a ordem de exibição no site</p>
        </div>
      </div>

      {errorMsg && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{errorMsg}</div>
      )}

      {loading || !slots ? (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <LoadingSpinner label="Carregando categorias..." />
        </div>
      ) : !hasEnoughCategorias ? (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="py-10 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
            <AlertCircle size={22} />
            Você precisa de pelo menos {SLOT_COUNT} categorias cadastradas para configurar a vitrine.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Slots — ordem de exibição no site */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-gray-800">Ordem de exibição</h4>
              <span className={`text-xs font-semibold ${filledCount === SLOT_COUNT ? "text-emerald-600" : "text-amber-600"}`}>
                {filledCount}/{SLOT_COUNT} selecionadas
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Arraste os cards para reordenar ou para preencher um espaço vazio. Clique no <span className="font-semibold text-gray-500">×</span> pra remover uma categoria da vitrine.
            </p>

            <div className="flex flex-wrap gap-4">
              {slots.map((cat, i) =>
                cat ? (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(i)}
                    onDragEnd={() => setDragIndex(null)}
                    className={`relative w-full sm:w-48 h-[172px] flex flex-col items-center justify-center text-center p-5 rounded-2xl border-2 bg-white cursor-grab active:cursor-grabbing transition-all select-none ${
                      dragIndex === i ? "opacity-40 border-dashed border-gray-300" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    }`}
                    title="Arraste para reordenar"
                  >
                    <button
                      onClick={() => handleRemoveSlot(i)}
                      title="Remover da vitrine do site"
                      className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>

                    <GripVertical size={14} className="absolute top-2 left-2 text-gray-300" />
                    <span className="absolute top-2 right-8 text-[10px] font-bold text-gray-300">#{i + 1}</span>

                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    >
                      {iconMap[cat.icon] ?? iconMap.FileText}
                    </div>
                    <p className="text-gray-800 font-semibold text-sm mb-1">{cat.name}</p>
                    <p className="text-gray-400 text-xs leading-snug line-clamp-2">{cat.description || "Sem descrição"}</p>
                  </div>
                ) : (
                  <div
                    key={`empty-${i}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(i)}
                    className="w-full sm:w-48 h-[172px] flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-300 hover:border-gray-300 hover:text-gray-400 transition-colors"
                  >
                    <Plus size={26} />
                    <span className="text-xs text-center px-4">Arraste uma categoria aqui</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Lista com checkbox */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-0">
            <h4 className="text-sm font-bold text-gray-800 mb-4 shrink-0">Todas as categorias</h4>
            <ul className="space-y-1 overflow-y-auto flex-1 min-h-0">
              {categoriasData?.map((cat) => {
                const checked = selectedIds.has(cat.id);
                const disabled = !checked && filledCount >= SLOT_COUNT;
                return (
                  <li key={cat.id}>
                    <label
                      className={`flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
                        disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleCategoria(cat)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                      >
                        <span style={{ transform: "scale(0.7)", display: "flex" }}>{iconMap[cat.icon] ?? iconMap.FileText}</span>
                      </div>
                      <span className="text-sm text-gray-700 font-medium truncate">{cat.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        {hasEnoughCategorias && filledCount !== SLOT_COUNT && (
          <p className="text-amber-600 text-xs font-medium sm:mr-auto">
            Selecione exatamente {SLOT_COUNT} categorias para salvar ({filledCount}/{SLOT_COUNT}).
          </p>
        )}
        <button
          onClick={() => navigate("/admin/categorias")}
          className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={submitting || loading || !slots || filledCount !== SLOT_COUNT}
          className="btn-primary px-6 py-2.5 text-sm font-bold flex items-center justify-center gap-2"
          style={saved ? { backgroundColor: "#15803D" } : undefined}
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : saved ? <><Check size={15} /> Salvo!</> : "Salvar ordem"}
        </button>
      </div>
    </div>
  );
}
