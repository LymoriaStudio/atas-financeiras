import { useEffect, useState } from "react";
import { Eye, Download, Search, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, SlidersHorizontal, Calendar, X, Loader2, FileX } from "lucide-react";
import { getAtas, incrementDownloads, type Ata } from "../../lib/api/atasService";


type QuickPeriod = "todos" | "mes" | "trimestre" | "semestre" | "ano";
const QUICK_PERIODS: { label: string; value: QuickPeriod }[] = [
  { label: "Todos", value: "todos" },
  { label: "Este mês", value: "mes" },
  { label: "Último trimestre", value: "trimestre" },
  { label: "Último semestre", value: "semestre" },
  { label: "Este ano", value: "ano" },
];

function quickRange(period: QuickPeriod): { from: string; to: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = iso(now);
  if (period === "mes") return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
  if (period === "trimestre") { const f = new Date(now); f.setMonth(f.getMonth() - 3); return { from: iso(f), to: today }; }
  if (period === "semestre") { const f = new Date(now); f.setMonth(f.getMonth() - 6); return { from: iso(f), to: today }; }
  if (period === "ano") return { from: iso(new Date(now.getFullYear(), 0, 1)), to: today };
  return { from: "", to: "" };
}

function formatDateBR(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
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

const PER_PAGE = 8;

interface AllAtasProps {
  onBack: () => void;
}

export function AllAtas({ onBack }: AllAtasProps) {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewingAta, setViewingAta] = useState<Ata | null>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [year, setYear] = useState("Todos os anos");
  const [page, setPage] = useState(1);
  const [quickPeriod, setQuickPeriod] = useState<QuickPeriod>("todos");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setErrorMsg(null);
    const atasRes = await getAtas();

    if (atasRes.error) {
      setErrorMsg("Não foi possível carregar as atas. Tente novamente.");
    } else {
      const publicadas = (atasRes.data ?? []).filter((a) => a.status === "Publicado");
      setAtas(publicadas);
    }

    setLoading(false);
  }

  const CATEGORIES = [
    "Todas",
    ...Array.from(new Set(atas.map((a) => (a as any).tipo).filter(Boolean))).sort(),
  ];

  const YEARS = ["Todos os anos", ...Array.from(
    new Set(atas.map((a) => a.data?.slice(0, 4)).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a))];

  const handleQuick = (p: QuickPeriod) => {
    setQuickPeriod(p); setShowCustom(false); setPage(1);
    if (p === "todos") { setFromDate(""); setToDate(""); return; }
    const { from, to } = quickRange(p);
    setFromDate(from); setToDate(to);
  };

  const handleCustom = () => {
    setShowCustom(true); setQuickPeriod("todos"); setFromDate(""); setToDate(""); setPage(1);
  };

  const clearDates = () => {
    setFromDate(""); setToDate(""); setQuickPeriod("todos"); setShowCustom(false); setPage(1);
  };

  const hasDateFilter = !!(fromDate || toDate);

  const filtered = atas.filter((a) => {
    const q = query.toLowerCase();
    const matchQuery = q === "" || a.titulo.toLowerCase().includes(q) || a.numero.toLowerCase().includes(q);

    const tipo = (a as any).tipo ?? "";
    const matchCat = category === "Todas" || tipo === category;

    const matchYear = year === "Todos os anos" || a.data?.slice(0, 4) === year;

    const d = a.data ? new Date(a.data).getTime() : 0;
    const matchDate = !hasDateFilter ||
      ((!fromDate || d >= new Date(fromDate).getTime()) && (!toDate || d <= new Date(toDate).getTime()));

    return matchQuery && matchCat && matchYear && matchDate;
  });

  const sorted = [...filtered].sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilter = (key: string, value: string) => {
    setPage(1);
    if (key === "category") setCategory(value);
    if (key === "year") setYear(value);
  };

  const getLatestFile = (ata: Ata) => {
    if (!ata.arquivos || ata.arquivos.length === 0) return null;
    return ata.arquivos[ata.arquivos.length - 1];
  };

  const handleView = (ata: Ata) => setViewingAta(ata);

const handleDownload = async (ata: Ata) => {
  const file = getLatestFile(ata);
  if (!file) return;
  const res = await fetch(file.url);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.nome;
  a.click();
  URL.revokeObjectURL(url);
  const { data, error } = await incrementDownloads(ata.id, ata.downloads_count ?? 0);
  if (!error && data) {
    setAtas((prev) => prev.map((a) => (a.id === ata.id ? data : a)));
  }
};

  const viewingFile = viewingAta ? getLatestFile(viewingAta) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar ao início
          </button>
          <span className="text-gray-200">|</span>
          <span className="text-gray-400 text-sm">Todas as Atas</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-10 w-full max-w-3xl">
          <h1 style={{ color: "#111827", fontSize: "2rem", fontWeight: 700 }} className="mb-2">
            Todas as Atas
          </h1>
          <p className="text-gray-400 text-sm">
            Consulte o histórico completo de atas, documentos financeiros e estatutos da SBS Participações.
          </p>
        </div>

        {/* Filters */}
        <div className="w-full max-w-5xl mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1 relative w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Pesquise por número da ata ou título..."
                className="w-full pl-5 pr-14 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm"
              />
              <div className="absolute right-0 top-0 bottom-0 px-4 flex items-center text-gray-400">
                <Search size={17} />
              </div>
            </div>

            {/* Year */}
            <div className="w-full lg:w-44 text-left">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ano</label>
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => handleFilter("year", e.target.value)}
                  className="w-full appearance-none px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none shadow-sm"
                >
                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Category */}
            <div className="w-full lg:w-44 text-left">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Categoria</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => handleFilter("category", e.target.value)}
                  className="w-full appearance-none px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none shadow-sm"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => handleFilter("category", c)}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition-all border"
                style={
                  category === c
                    ? { backgroundColor: "#111827", color: "#fff", borderColor: "#111827" }
                    : { backgroundColor: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Period filters */}
        <div className="w-full max-w-5xl mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar size={14} className="text-gray-400 shrink-0" />
            {QUICK_PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => handleQuick(p.value)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={quickPeriod === p.value && !showCustom
                  ? { backgroundColor: "#111827", color: "#fff", borderColor: "#111827" }
                  : { backgroundColor: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
                }
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={handleCustom}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={showCustom
                ? { backgroundColor: "#111827", color: "#fff", borderColor: "#111827" }
                : { backgroundColor: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
              }
            >
              Personalizado
            </button>
            {hasDateFilter && (
              <button onClick={clearDates} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                <X size={12} /> Limpar datas
              </button>
            )}
          </div>

          {showCustom && (
            <div className="flex gap-3 mt-3 max-w-sm">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">De</label>
                <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-100" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Até</label>
                <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-100" />
              </div>
            </div>
          )}

          {hasDateFilter && (
            <p className="text-xs text-gray-400 mt-2">
              Exibindo documentos{fromDate ? ` a partir de ${fromDate.split("-").reverse().join("/")}` : ""}
              {toDate ? ` até ${toDate.split("-").reverse().join("/")}` : ""}
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="w-full max-w-5xl mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Count */}
        <div className="w-full max-w-5xl mb-4 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            <span className="font-semibold text-gray-700">{sorted.length}</span> documento{sorted.length !== 1 ? "s" : ""} encontrado{sorted.length !== 1 ? "s" : ""}
          </p>
          <div className="hidden sm:flex items-center gap-1 text-gray-400 text-xs">
            <SlidersHorizontal size={13} />
            <span>Ordenado por data</span>
          </div>
        </div>

        {/* Listing */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full max-w-5xl">
          {/* Table header — apenas desktop */}
          <div className="hidden md:grid grid-cols-12 px-6 py-4 border-b border-gray-100 text-left">
            <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nº da ATA</div>
            <div className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Título</div>
            <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</div>
            <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</div>
            <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</div>
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center gap-2 text-gray-400 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Carregando atas...
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-sm">
              Nenhum documento encontrado para os filtros selecionados.
            </div>
          ) : (
            paginated.map((ata) => {
              const tipo = (ata as any).tipo ?? "";
              const file = getLatestFile(ata);
              return (
                <div key={ata.id} className="border-b border-gray-50 last:border-0">
                  {/* ── Linha desktop ── */}
                  <div className="hidden md:grid grid-cols-12 px-6 py-4 hover:bg-gray-50/60 transition-colors items-center text-left">
                    <div className="col-span-3">
                      <span className="text-gray-800 text-sm font-medium">{ata.numero}</span>
                    </div>
                    <div className="col-span-4">
                      <span className="text-gray-600 text-sm">{ata.titulo}</span>
                    </div>
                    <div className="col-span-2 flex flex-wrap gap-1">
                      {tipo ? (
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          style={getTipoStyle(tipo)}
                        >
                          {tipo}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 text-sm">{formatDateBR(ata.data)}</span>
                    </div>
                    <div className="col-span-1 flex items-center gap-2">
                      <button
                        onClick={() => handleView(ata)}
                        disabled={!file}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={file ? "Visualizar" : "Sem arquivo"}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleDownload(ata)}
                        disabled={!file}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={file ? "Baixar" : "Sem arquivo"}
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  </div>

                  {/* ── Card mobile ── */}
                  <div className="md:hidden px-4 py-4 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-gray-800 text-sm font-semibold">{ata.numero}</p>
                        <p className="text-gray-600 text-sm mt-0.5 leading-snug">{ata.titulo}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleView(ata)}
                          disabled={!file}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={file ? "Visualizar" : "Sem arquivo"}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDownload(ata)}
                          disabled={!file}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={file ? "Baixar" : "Sem arquivo"}
                        >
                          <Download size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <div className="flex flex-wrap gap-1">
                        {tipo ? (
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                            style={getTipoStyle(tipo)}
                          >
                            {tipo}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs shrink-0">{formatDateBR(ata.data)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className="w-9 h-9 rounded-lg border text-sm font-medium transition-all"
                style={
                  n === page
                    ? { backgroundColor: "#111827", color: "#fff", borderColor: "#111827" }
                    : { backgroundColor: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
                }
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* View (PDF) Modal */}
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
                  <button
                    onClick={() => handleDownload(viewingAta)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Baixar PDF"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Baixar</span>
                  </button>
                )}
                <button onClick={() => setViewingAta(null)} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
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
    </div>
  );
}