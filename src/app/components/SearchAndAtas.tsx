import { useEffect, useState } from "react";
import { Search, ChevronDown, Eye, Download, ArrowRight, Loader2, FileX, X } from "lucide-react";
import { getAtas, incrementDownloads, type Ata } from "../../lib/api/atasService";
import { logAtividade } from "../../lib/api/atividadesService";

const PREVIEW_COUNT = 5;

function formatDateBR(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

interface Props {
  onVerTodas: () => void;
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

export function SearchAndAtas({ onVerTodas }: Props) {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingAta, setViewingAta] = useState<Ata | null>(null);

  const [query, setQuery] = useState("");
  const [year, setYear] = useState("Todos os anos");
  const [category, setCategory] = useState("Todas as categorias");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const atasRes = await getAtas();
    if (!atasRes.error && atasRes.data) {
      setAtas(atasRes.data.filter((a) => a.status === "Publicado"));
    }
    setLoading(false);
  }

  const YEARS = ["Todos os anos", ...Array.from(
    new Set(atas.map((a) => a.data?.slice(0, 4)).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a))];

  const CATEGORIES = [
    "Todas as categorias",
    ...Array.from(new Set(atas.map((a) => (a as any).tipo).filter(Boolean))).sort(),
  ];

  const isFiltering = query !== "" || year !== "Todos os anos" || category !== "Todas as categorias";

  const filtered = atas.filter((a) => {
    const q = query.toLowerCase();
    const matchQ = q === "" || a.titulo.toLowerCase().includes(q) || a.numero.toLowerCase().includes(q);
    const matchY = year === "Todos os anos" || a.data?.slice(0, 4) === year;
    const tipo = (a as any).tipo ?? "";
    const matchCat = category === "Todas as categorias" || tipo === category;
    return matchQ && matchY && matchCat;
  });

  const sorted = [...filtered].sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  const displayed = isFiltering ? sorted : sorted.slice(0, PREVIEW_COUNT);

  const getLatestFile = (ata: Ata) => {
    if (!ata.arquivos || ata.arquivos.length === 0) return null;
    return ata.arquivos[ata.arquivos.length - 1];
  };

  const viewingFile = viewingAta ? getLatestFile(viewingAta) : null;

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
    await incrementDownloads(ata.id, ata.downloads_count ?? 0);
    const categoriaLabel = ata.tipo ? ` da categoria ${ata.tipo}` : "";
    logAtividade(`Você teve 1 Download de documento${categoriaLabel}`, ata.titulo);
  };

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
            <p className="text-gray-400 text-xs hidden sm:block">Confira os documentos mais recentes</p>
          )}
        </div>

        {/* Listing */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
          <div className="hidden md:grid grid-cols-12 px-6 py-3.5 border-b border-gray-100 bg-gray-50/80 text-left">
            <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nº da ATA</div>
            <div className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Título</div>
            <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</div>
            <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</div>
            <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</div>
          </div>

          {loading ? (
            <div className="py-14 flex items-center justify-center gap-2 text-gray-400 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Carregando atas...
            </div>
          ) : displayed.length === 0 ? (
            <div className="py-14 text-center text-gray-400 text-sm">
              Nenhum documento encontrado para os filtros selecionados.
            </div>
          ) : (
            displayed.map((ata) => {
              const tipo = (ata as any).tipo ?? "";
              const file = getLatestFile(ata);
              return (
                <div key={ata.id} className="border-b border-gray-50 last:border-0">
                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-12 px-6 py-4 hover:bg-gray-50/60 transition-colors items-center text-left">
                    <div className="col-span-3 text-gray-800 text-sm font-medium">{ata.numero}</div>
                    <div className="col-span-4 text-gray-500 text-sm truncate pr-4">{ata.titulo}</div>
                    <div className="col-span-2 flex flex-wrap gap-1">
                      {tipo ? (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium" style={getTipoStyle(tipo)}>
                          {tipo}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </div>
                    <div className="col-span-2 text-gray-500 text-sm">{formatDateBR(ata.data)}</div>
                    <div className="col-span-1 flex items-center gap-1">
                      <button
                        onClick={() => handleView(ata)}
                        disabled={!file}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={file ? "Visualizar" : "Sem arquivo"}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDownload(ata)}
                        disabled={!file}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={file ? "Baixar" : "Sem arquivo"}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden px-4 py-4 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-gray-800 text-sm font-semibold">{ata.numero}</p>
                        <p className="text-gray-500 text-sm mt-0.5 leading-snug">{ata.titulo}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleView(ata)}
                          disabled={!file}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={file ? "Visualizar" : "Sem arquivo"}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDownload(ata)}
                          disabled={!file}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={file ? "Baixar" : "Sem arquivo"}
                        >
                          <Download size={15} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <div className="flex flex-wrap gap-1">
                        {tipo ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium" style={getTipoStyle(tipo)}>
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
          <button
            onClick={() => { setQuery(""); setYear("Todos os anos"); setCategory("Todas as categorias"); }}
            className="mt-4 text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* View Modal */}
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
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Baixar</span>
                  </button>
                )}
                <button
                  onClick={() => setViewingAta(null)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100">
              {viewingFile ? (
                <iframe src={viewingFile.url} title={`PDF de ${viewingAta.titulo}`} className="w-full h-full" style={{ border: "none" }} />
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
    </section>
  );
}