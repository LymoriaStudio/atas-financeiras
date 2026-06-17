import { useState } from "react";
import { ArrowLeft, Eye, Download, Search, BarChart2, FileText, Gavel, Calendar, X } from "lucide-react";

const ALL_DOCS = [
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

const META: Record<string, { icon: React.ReactNode; color: string; bg: string; description: string }> = {
  Financeiro: { icon: <BarChart2 size={28} />, color: "#15803D", bg: "#F0FDF4", description: "Balanços, demonstrativos financeiros, fluxos de caixa e relatórios de gestão." },
  Atas:       { icon: <FileText size={28} />, color: "#1D4ED8", bg: "#EFF6FF", description: "Atas de assembleias gerais, reuniões ordinárias e extraordinárias da diretoria." },
  Estatuto:   { icon: <Gavel size={28} />, color: "#7E22CE", bg: "#FDF4FF", description: "Estatuto social, regimento interno, emendas e normas institucionais." },
};

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

function toISO(d: string): string {
  const [day, month, year] = d.split("/");
  return `${year}-${month}-${day}`;
}

function inRange(docDate: string, from: string, to: string): boolean {
  const d = parseBR(docDate).getTime();
  const f = from ? new Date(from).getTime() : -Infinity;
  const t = to   ? new Date(to).getTime()   : Infinity;
  return d >= f && d <= t;
}

function quickRange(period: QuickPeriod): { from: string; to: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = iso(now);

  if (period === "mes") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: iso(from), to: today };
  }
  if (period === "trimestre") {
    const from = new Date(now);
    from.setMonth(from.getMonth() - 3);
    return { from: iso(from), to: today };
  }
  if (period === "semestre") {
    const from = new Date(now);
    from.setMonth(from.getMonth() - 6);
    return { from: iso(from), to: today };
  }
  if (period === "ano") {
    const from = new Date(now.getFullYear(), 0, 1);
    return { from: iso(from), to: today };
  }
  return { from: "", to: "" };
}

interface CategoryPageProps {
  category: string;
  onBack: () => void;
}

export function CategoryPage({ category, onBack }: CategoryPageProps) {
  const [query, setQuery]           = useState("");
  const [quickPeriod, setQuickPeriod] = useState<QuickPeriod>("todos");
  const [fromDate, setFromDate]     = useState("");
  const [toDate, setToDate]         = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const meta = META[category];

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

  const hasDateFilter = fromDate || toDate;

  const docs = ALL_DOCS.filter((d) => {
    const matchCat   = d.category === category;
    const matchQuery = query === "" || d.title.toLowerCase().includes(query.toLowerCase()) || d.id.toLowerCase().includes(query.toLowerCase());
    const matchDate  = !hasDateFilter || inRange(d.date, fromDate, toDate);
    return matchCat && matchQuery && matchDate;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-gray-800 text-sm transition-colors">
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
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: meta.bg, color: meta.color }}>
            {meta.icon}
          </div>
          <h1 style={{ color: "#111827", fontSize: "2rem", fontWeight: 700 }} className="mb-2">{category}</h1>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">{meta.description}</p>
          <span className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: meta.bg, color: meta.color }}>
            {docs.length} documento{docs.length !== 1 ? "s" : ""}
          </span>
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
              <button onClick={clearDates} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 ml-1 transition-colors">
                <X size={12} /> Limpar
              </button>
            )}
          </div>

          {/* Custom date range */}
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

          {/* Active filter summary */}
          {hasDateFilter && (
            <p className="text-xs text-gray-400 mt-2">
              Exibindo documentos{fromDate ? ` a partir de ${fromDate.split("-").reverse().join("/")}` : ""}
              {toDate ? ` até ${toDate.split("-").reverse().join("/")}` : ""}
            </p>
          )}
        </div>

        {/* Document list */}
        <div className="w-full space-y-3">
          {docs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              Nenhum documento encontrado para o período selecionado.
            </div>
          ) : (
            docs.map((doc, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center justify-between gap-4 hover:shadow-sm hover:border-gray-200 transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: meta.bg, color: meta.color }}>
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-800 text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{doc.id} · {doc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Visualizar">
                    <Eye size={15} />
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Baixar">
                    <Download size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
