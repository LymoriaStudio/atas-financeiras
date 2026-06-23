import { useEffect, useState } from "react";
import { ArrowLeft, Eye, Download, Search, BarChart2, FileText, Gavel, Calendar, X, Loader2 } from "lucide-react";
import { getAtas, type Ata } from "../../lib/api/atasService";

// Metadados visuais por tipo — ajuste as chaves para bater com os valores do campo `tipo` na API
const META: Record<string, { icon: React.ReactNode; color: string; bg: string; description: string }> = {
  Financeiro: {
    icon: <BarChart2 size={28} />,
    color: "#15803D",
    bg: "#F0FDF4",
    description: "Balanços, demonstrativos financeiros, fluxos de caixa e relatórios de gestão.",
  },
  Atas: {
    icon: <FileText size={28} />,
    color: "#1D4ED8",
    bg: "#EFF6FF",
    description: "Atas de assembleias gerais, reuniões ordinárias e extraordinárias da diretoria.",
  },
  Estatuto: {
    icon: <Gavel size={28} />,
    color: "#7E22CE",
    bg: "#FDF4FF",
    description: "Estatuto social, regimento interno, emendas e normas institucionais.",
  },
};

// Fallback para tipos sem metadado definido
function getMeta(tipo: string) {
  return (
    META[tipo] ?? {
      icon: <FileText size={28} />,
      color: "#111827",
      bg: "#F9FAFB",
      description: `Documentos da categoria ${tipo}.`,
    }
  );
}

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

interface CategoryPageProps {
  category: string;
  onBack: () => void;
}

export function CategoryPage({ category, onBack }: CategoryPageProps) {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [quickPeriod, setQuickPeriod] = useState<QuickPeriod>("todos");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const meta = getMeta(category);

  useEffect(() => {
    fetchData();
  }, [category]);

  async function fetchData() {
    setLoading(true);
    setErrorMsg(null);
    const atasRes = await getAtas();
    if (atasRes.error) {
      setErrorMsg("Não foi possível carregar os documentos. Tente novamente.");
    } else {
      const publicadas = (atasRes.data ?? []).filter(
        (a) => a.status === "Publicado" && (a as any).tipo === category
      );
      setAtas(publicadas);
    }
    setLoading(false);
  }

  const handleQuick = (p: QuickPeriod) => {
    setQuickPeriod(p);
    setShowCustom(false);
    if (p === "todos") { setFromDate(""); setToDate(""); return; }
    const { from, to } = quickRange(p);
    setFromDate(from);
    setToDate(to);
  };

  const handleCustom = () => {
    setShowCustom(true);
    setQuickPeriod("todos");
    setFromDate("");
    setToDate("");
  };

  const clearDates = () => {
    setFromDate(""); setToDate("");
    setQuickPeriod("todos");
    setShowCustom(false);
  };

  const hasDateFilter = !!(fromDate || toDate);

  const getLatestFile = (ata: Ata) => {
    if (!ata.arquivos || ata.arquivos.length === 0) return null;
    return ata.arquivos[ata.arquivos.length - 1];
  };

  const filtered = atas.filter((a) => {
    const matchQuery =
      query === "" ||
      a.titulo.toLowerCase().includes(query.toLowerCase()) ||
      a.numero.toLowerCase().includes(query.toLowerCase());

    const d = a.data ? new Date(a.data).getTime() : 0;
    const matchDate =
      !hasDateFilter ||
      ((!fromDate || d >= new Date(fromDate).getTime()) &&
        (!toDate || d <= new Date(toDate).getTime()));

    return matchQuery && matchDate;
  });

  const sorted = [...filtered].sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-800 text-sm transition-colors"
          >
            <ArrowLeft size={15} /> Voltar
          </button>
          <span className="text-gray-200">|</span>
          <span className="text-gray-400 text-sm">Categorias</span>
          <span className="text-gray-200">/</span>
          <span className="text-sm font-medium" style={{ color: meta.color }}>{category}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col items-center">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ backgroundColor: meta.bg, color: meta.color }}
          >
            {meta.icon}
          </div>
          <h1 style={{ color: "#111827", fontSize: "2rem", fontWeight: 700 }} className="mb-2">
            {category}
          </h1>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">{meta.description}</p>
          {!loading && (
            <span
              className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: meta.bg, color: meta.color }}
            >
              {sorted.length} documento{sorted.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full mb-4">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Buscar em ${category}...`}
            className="w-full pl-11 pr-5 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 shadow-sm"
          />
        </div>

        {/* Period filters */}
        <div className="w-full mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar size={14} className="text-gray-400 shrink-0" />
            {QUICK_PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => handleQuick(p.value)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={
                  quickPeriod === p.value && !showCustom
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
              style={
                showCustom
                  ? { backgroundColor: "#111827", color: "#fff", borderColor: "#111827" }
                  : { backgroundColor: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
              }
            >
              Personalizado
            </button>
            {hasDateFilter && (
              <button
                onClick={clearDates}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 ml-1 transition-colors"
              >
                <X size={12} /> Limpar
              </button>
            )}
          </div>

          {showCustom && (
            <div className="flex gap-3 mt-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">De</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-100"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Até</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-100"
                />
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
          <div className="w-full mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Document list */}
        <div className="w-full space-y-3">
          {loading ? (
            <div className="py-20 flex items-center justify-center gap-2 text-gray-400 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Carregando documentos...
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              Nenhum documento encontrado para o período selecionado.
            </div>
          ) : (
            sorted.map((ata) => {
              const file = getLatestFile(ata);
              return (
                <div
                  key={ata.id}
                  className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center justify-between gap-4 hover:shadow-sm hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: meta.bg, color: meta.color }}
                    >
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-800 text-sm font-medium truncate">{ata.titulo}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {ata.numero} · {formatDateBR(ata.data)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => file && window.open(file.url, "_blank")}
                      disabled={!file}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={file ? "Visualizar" : "Sem arquivo"}
                    >
                      <Eye size={15} />
                    </button>
                    <a
                      href={file?.url}
                      download={file?.nome}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => { if (!file) e.preventDefault(); }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors ${!file ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}`}
                      title={file ? "Baixar" : "Sem arquivo"}
                    >
                      <Download size={15} />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}