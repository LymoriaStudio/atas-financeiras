import { useState } from "react";
import { Eye, Download, Search, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, SlidersHorizontal, Calendar, X } from "lucide-react";

type QuickPeriod = "todos" | "mes" | "trimestre" | "semestre" | "ano";
const QUICK_PERIODS: { label: string; value: QuickPeriod }[] = [
  { label: "Todos", value: "todos" },
  { label: "Este mês", value: "mes" },
  { label: "Último trimestre", value: "trimestre" },
  { label: "Último semestre", value: "semestre" },
  { label: "Este ano", value: "ano" },
];

function parseBR(d: string): Date {
  const [day, month, year] = d.split("/").map(Number);
  return new Date(year, month - 1, day);
}

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

const ALL_ATAS = [
  { id: "ATA - 0001/2026.001", title: "Ata da Assembleia Geral Ordinária", category: "Atas", date: "02/01/2026" },
  { id: "ATA - 0002/2026.002", title: "Balanço Patrimonial – Exercício 2025", category: "Financeiro", date: "15/01/2026" },
  { id: "ATA - 0003/2026.003", title: "Estatuto Social Consolidado", category: "Estatuto", date: "20/01/2026" },
  { id: "ATA - 0004/2026.004", title: "Ata da Reunião do Conselho de Administração", category: "Atas", date: "03/02/2026" },
  { id: "ATA - 0005/2026.005", title: "Demonstrações Financeiras – 1º Trimestre", category: "Financeiro", date: "10/02/2026" },
  { id: "ATA - 0006/2026.006", title: "Ata da Assembleia Extraordinária", category: "Atas", date: "18/02/2026" },
  { id: "ATA - 0007/2026.007", title: "Alteração do Estatuto Social – Art. 12", category: "Estatuto", date: "25/02/2026" },
  { id: "ATA - 0008/2026.008", title: "Relatório de Gestão Financeira", category: "Financeiro", date: "05/03/2026" },
  { id: "ATA - 0009/2026.009", title: "Ata da Reunião Ordinária – Março", category: "Atas", date: "12/03/2026" },
  { id: "ATA - 0010/2026.010", title: "Fluxo de Caixa – 1º Bimestre 2026", category: "Financeiro", date: "20/03/2026" },
  { id: "ATA - 0011/2026.011", title: "Ata da Reunião da Diretoria Executiva", category: "Atas", date: "01/04/2026" },
  { id: "ATA - 0012/2026.012", title: "Emenda Estatutária – Governança Corporativa", category: "Estatuto", date: "08/04/2026" },
  { id: "ATA - 0013/2026.013", title: "Demonstrativo de Resultados – 2º Trimestre", category: "Financeiro", date: "15/04/2026" },
  { id: "ATA - 0014/2026.014", title: "Ata da Assembleia Geral Extraordinária", category: "Atas", date: "22/04/2026" },
  { id: "ATA - 0015/2026.015", title: "Relatório de Auditoria Interna", category: "Financeiro", date: "30/04/2026" },
  { id: "ATA - 0016/2026.016", title: "Ata de Reunião – Aprovação de Orçamento", category: "Atas", date: "05/05/2026" },
  { id: "ATA - 0017/2026.017", title: "Regimento Interno Atualizado", category: "Estatuto", date: "12/05/2026" },
  { id: "ATA - 0018/2026.018", title: "Balanço Semestral – Junho 2026", category: "Financeiro", date: "20/05/2026" },
];

const CATEGORIES = ["Todas", "Financeiro", "Atas", "Estatuto"];
const YEARS = ["Todos os anos", "2026", "2025", "2024"];
const PER_PAGE = 8;

const categoryStyle: Record<string, { bg: string; text: string }> = {
  Atas:       { bg: "#EFF6FF", text: "#1D4ED8" },
  Financeiro: { bg: "#F0FDF4", text: "#15803D" },
  Estatuto:   { bg: "#FDF4FF", text: "#7E22CE" },
};

interface AllAtasProps {
  onBack: () => void;
}

export function AllAtas({ onBack }: AllAtasProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [year, setYear] = useState("Todos os anos");
  const [page, setPage] = useState(1);
  const [quickPeriod, setQuickPeriod] = useState<QuickPeriod>("todos");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showCustom, setShowCustom] = useState(false);

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

  const filtered = ALL_ATAS.filter((a) => {
    const matchQuery = query === "" || a.title.toLowerCase().includes(query.toLowerCase()) || a.id.toLowerCase().includes(query.toLowerCase());
    const matchCat = category === "Todas" || a.category === category;
    const matchYear = year === "Todos os anos" || a.date.includes(year.slice(2));
    const d = parseBR(a.date).getTime();
    const matchDate = !hasDateFilter ||
      ((!fromDate || d >= new Date(fromDate).getTime()) && (!toDate || d <= new Date(toDate).getTime()));
    return matchQuery && matchCat && matchYear && matchDate;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilter = (key: string, value: string) => {
    setPage(1);
    if (key === "category") setCategory(value);
    if (key === "year") setYear(value);
  };

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

        {/* Count */}
        <div className="w-full max-w-5xl mb-4 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            <span className="font-semibold text-gray-700">{filtered.length}</span> documento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <SlidersHorizontal size={13} />
            <span>Ordenado por data</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full max-w-5xl">
          <div className="grid grid-cols-12 px-6 py-4 border-b border-gray-100 text-left">
            <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nº da ATA</div>
            <div className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Título</div>
            <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</div>
            <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</div>
            <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</div>
          </div>

          {paginated.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-sm">
              Nenhum documento encontrado para os filtros selecionados.
            </div>
          ) : (
            paginated.map((ata, i) => {
              const style = categoryStyle[ata.category] ?? { bg: "#F3F4F6", text: "#374151" };
              return (
                <div
                  key={i}
                  className="grid grid-cols-12 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors items-center text-left"
                >
                  <div className="col-span-3">
                    <span className="text-gray-800 text-sm font-medium">{ata.id}</span>
                  </div>
                  <div className="col-span-4">
                    <span className="text-gray-600 text-sm">{ata.title}</span>
                  </div>
                  <div className="col-span-2">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      {ata.category}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 text-sm">{ata.date}</span>
                  </div>
                  <div className="col-span-1 flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800" title="Visualizar">
                      <Eye size={15} />
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800" title="Baixar">
                      <Download size={15} />
                    </button>
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
    </div>
  );
}
