import { useEffect, useState } from "react";
import { Search, ChevronDown, Eye, Download, ArrowRight, Loader2 } from "lucide-react";
import { getAtas, type Ata } from "../../lib/api/atasService";
import { getCategorias, type Categoria } from "../../lib/api/categoriasService";

const PREVIEW_COUNT = 5;

function formatDateBR(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

// garante array independente do que vier da API
function toArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.length) return [raw];
  return [];
}

interface Props {
  onVerTodas: () => void;
}

export function SearchAndAtas({ onVerTodas }: Props) {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [year, setYear] = useState("Todos os anos");
  const [category, setCategory] = useState("Todas as categorias");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [atasRes, catsRes] = await Promise.all([getAtas(), getCategorias()]);
    console.log(atasRes)
    if (!atasRes.error && atasRes.data) {
      // Página pública: mostra só o que foi publicado
      const publicadas = atasRes.data.filter((a) => a.status === "Publicado");
      setAtas(publicadas);
    }

    if (!catsRes.error && catsRes.data) {
      setCategorias(catsRes.data);
    }

    setLoading(false);
  }

  const categoriaMap = Object.fromEntries(categorias.map((c) => [c.id, c]));

  const YEARS = ["Todos os anos", ...Array.from(
    new Set(atas.map((a) => a.data?.slice(0, 4)).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a))];

  const CATEGORIES = ["Todas as categorias", ...categorias.map((c) => c.name)];

  const isFiltering = query !== "" || year !== "Todos os anos" || category !== "Todas as categorias";

  const filtered = atas.filter((a) => {
    const q = query.toLowerCase();
    const matchQ = q === "" || a.titulo.toLowerCase().includes(q) || a.numero.toLowerCase().includes(q);
    const matchY = year === "Todos os anos" || a.data?.slice(0, 4) === year;
    const catIds = toArray((a as any).categoria_id);
    const matchCat = category === "Todas as categorias" || catIds.some((id) => categoriaMap[id]?.name === category);
    return matchQ && matchY && matchCat;
  });

  // ordena por data do evento, mais recente primeiro
  const sorted = [...filtered].sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  const displayed = isFiltering ? sorted : sorted.slice(0, PREVIEW_COUNT);

  const getLatestFile = (ata: Ata) => {
    if (!ata.arquivos || ata.arquivos.length === 0) return null;
    return ata.arquivos[ata.arquivos.length - 1];
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
              const deps = toArray((ata as any).categoria_id);
              const file = getLatestFile(ata);
              return (
                <div key={ata.id} className="grid grid-cols-12 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors items-center text-left">
                  <div className="col-span-3 text-gray-800 text-sm font-medium">{ata.numero}</div>
                  <div className="col-span-4 text-gray-500 text-sm truncate pr-4">{ata.titulo}</div>
                  <div className="col-span-2 flex flex-wrap gap-1">
                    {deps.length === 0 ? (
                      <span className="text-gray-300 text-xs">—</span>
                    ) : (
                      deps.map((id) => {
                        const cat = categoriaMap[id];
                        if (!cat) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                          >
                            {cat.name}
                          </span>
                        );
                      })
                    )}
                  </div>
                  <div className="col-span-2 text-gray-500 text-sm">{formatDateBR(ata.data)}</div>
                  <div className="col-span-1 flex items-center gap-1">
                    <button
                      onClick={() => file && window.open(file.url, "_blank")}
                      disabled={!file}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={file ? "Visualizar" : "Sem arquivo"}
                    >
                      <Eye size={14} />
                    </button>
                    <a
                      href={file?.url}
                      download={file?.nome}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => { if (!file) e.preventDefault(); }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors ${!file ? "opacity-30 cursor-not-allowed" : ""}`}
                      title={file ? "Baixar" : "Sem arquivo"}
                    >
                      <Download size={14} />
                    </a>
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