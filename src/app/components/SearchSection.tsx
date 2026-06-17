import { Search, ChevronDown } from "lucide-react";
import { useState } from "react";

const years = ["Todos os anos", "2026", "2025", "2024", "2023", "2022"];
const categories = ["Todas as categorias", "Financeiro", "Atas", "Estatuto"];

export function SearchSection() {
  const [selectedYear, setSelectedYear] = useState("Todos os anos");
  const [selectedCategory, setSelectedCategory] = useState("Todas as categorias");
  const [query, setQuery] = useState("");

  return (
    <section id="consultar" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <h2 style={{ color: "#111827", fontSize: "1.75rem", fontWeight: 700 }} className="mb-2">
          Consulta rápida
        </h2>
        <p className="text-gray-400 mb-10 text-sm">
          Pesquise e encontre atas de forma rápida e eficiente
        </p>

        <div className="flex flex-col lg:flex-row gap-4 items-end w-full max-w-4xl">
          <div className="flex-1 relative w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquise por número da ata, assunto ou palavra chave..."
              className="w-full pl-5 pr-14 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm"
            />
            <button
              className="absolute right-0 top-0 bottom-0 px-4 rounded-r-xl flex items-center justify-center text-white hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "#111827" }}
            >
              <Search size={17} />
            </button>
          </div>

          <div className="w-full lg:w-48 text-left">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ano</label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full appearance-none px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none shadow-sm"
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="w-full lg:w-48 text-left">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Categorias</label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none shadow-sm"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
