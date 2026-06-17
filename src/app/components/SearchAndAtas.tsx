import { useState } from "react";
import { Search, ChevronDown, Eye, Download, ArrowRight } from "lucide-react";

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

const YEARS = ["Todos os anos", "2026", "2025", "2024"];
const CATEGORIES = ["Todas as categorias", "Financeiro", "Atas", "Estatuto"];
const PREVIEW_COUNT = 5;

const catStyle: Record<string, { bg: string; text: string }> = {
  Atas:       { bg: "#EFF6FF", text: "#1D4ED8" },
  Financeiro: { bg: "#F0FDF4", text: "#15803D" },
  Estatuto:   { bg: "#FDF4FF", text: "#7E22CE" },
};

interface Props {
  onVerTodas: () => void;
}

export function SearchAndAtas({ onVerTodas }: Props) {
  const [query, setQuery]       = useState("");
  const [year, setYear]         = useState("Todos os anos");
  const [category, setCategory] = useState("Todas as categorias");

  const isFiltering = query !== "" || year !== "Todos os anos" || category !== "Todas as categorias";

  const filtered = ALL_ATAS.filter((a) => {
    const q = query.toLowerCase();
    const matchQ   = q === "" || a.title.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
    const matchY   = year === "Todos os anos" || a.date.endsWith(year);
    const matchCat = category === "Todas as categorias" || a.category === category;
    return matchQ && matchY && matchCat;
  });

  const displayed = isFiltering ? filtered : filtered.slice(0, PREVIEW_COUNT);

  return (
    <section id="consultar" className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-10">
          <h2 style={{ color: "#111827", fontSize: "1.75rem", fontWeight: 700 }} className="mb-2">
            Consulta rápida
          </h2>
          <p className="text-gray-400 text-sm">
            Pesquise e encontre atas de forma rápida e eficiente
          </p>
        </div>

        {/* Filters row */}
        <div className="flex flex-col lg:flex-row gap-3 items-end w-full mb-8">
          {/* Search */}
          <div className="flex-1 relative w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquise por número da ata, assunto ou palavra chave..."
              className="w-full pl-5 pr-14 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm"
            />
            <div className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center rounded-r-xl" style={{ backgroundColor: "#111827" }}>
              <Search size={16} className="text-white" />
            </div>
          </div>

          {/* Year */}
          <div className="w-full lg:w-44">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ano</label>
            <div className="relative">
              <select value={year} onChange={(e) => setYear(e.target.value)}
                className="w-full appearance-none px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none shadow-sm">
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Category */}
          <div className="w-full lg:w-48">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Categorias</label>
            <div className="relative">
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none shadow-sm">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table header label */}
        <div className="w-full flex items-center justify-between mb-3">
          <p className="text-gray-800 font-semibold text-sm">
            {isFiltering
              ? <>Resultados <span className="text-gray-400 font-normal">— {filtered.length} documento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</span></>
              : "Últimas Atas publicadas"}
          </p>
          {!isFiltering && (
            <p className="text-gray-400 text-xs">Confira os documentos mais recentes</p>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
          <div className="grid grid-cols-12 px-6 py-3.5 border-b border-gray-100 bg-gray-50/80 text-left">
            <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nº da ATA</div>
            <div className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Título</div>
            <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</div>
            <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</div>
            <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</div>
          </div>

          {displayed.length === 0 ? (
            <div className="py-14 text-center text-gray-400 text-sm">
              Nenhum documento encontrado para os filtros selecionados.
            </div>
          ) : (
            displayed.map((ata, i) => {
              const cs = catStyle[ata.category] ?? { bg: "#F3F4F6", text: "#374151" };
              return (
                <div key={i} className="grid grid-cols-12 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors items-center text-left">
                  <div className="col-span-3 text-gray-800 text-sm font-medium">{ata.id}</div>
                  <div className="col-span-4 text-gray-500 text-sm truncate pr-4">{ata.title}</div>
                  <div className="col-span-2">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: cs.bg, color: cs.text }}>
                      {ata.category}
                    </span>
                  </div>
                  <div className="col-span-2 text-gray-500 text-sm">{ata.date}</div>
                  <div className="col-span-1 flex items-center gap-1">
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Visualizar">
                      <Eye size={14} />
                    </button>
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Baixar">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {!isFiltering && (
          <button
            onClick={onVerTodas}
            className="mt-6 flex items-center gap-2 text-gray-700 text-sm px-6 py-3 rounded-xl border border-gray-200 hover:bg-white transition-colors"
          >
            Ver todas as atas
            <ArrowRight size={15} />
          </button>
        )}

        {isFiltering && filtered.length === 0 && (
          <button onClick={() => { setQuery(""); setYear("Todos os anos"); setCategory("Todas as categorias"); }}
            className="mt-4 text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2">
            Limpar filtros
          </button>
        )}
      </div>
    </section>
  );
}
