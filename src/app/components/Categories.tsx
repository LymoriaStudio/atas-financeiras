import { BarChart2, Gavel, FileText } from "lucide-react";

const categories = [
  { icon: <BarChart2 size={26} />, name: "Financeiro", description: "Documentos e registros financeiros" },
  { icon: <FileText size={26} />, name: "Atas", description: "Atas de reuniões e assembleias" },
  { icon: <Gavel size={26} />, name: "Estatuto", description: "Estatuto e normas institucionais" },
];

interface CategoriesProps {
  onCategoryClick?: (category: string) => void;
}

export function Categories({ onCategoryClick }: CategoriesProps) {
  return (
    <section id="transparencia" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <div className="mb-10">
          <h2 style={{ color: "#111827", fontSize: "1.75rem", fontWeight: 700 }} className="mb-2">
            Categorias
          </h2>
          <p className="text-gray-400 text-sm">
            Navegue pelas categorias e encontre as atas que você precisa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onCategoryClick?.(cat.name)}
              className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all group bg-white"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors group-hover:bg-gray-100"
                style={{ backgroundColor: "#F3F4F6", color: "#374151" }}
              >
                {cat.icon}
              </div>
              <p className="text-gray-800 font-semibold text-sm mb-1">{cat.name}</p>
              <p className="text-gray-400 text-xs leading-snug">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
