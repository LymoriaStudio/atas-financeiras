import { Eye, Download, ArrowRight } from "lucide-react";

const atas = [
  { id: "ATA - 1537/1423.726", title: "Ata de processo de licitação", category: "Atas", date: "08/04/2026" },
  { id: "ATA - 1537/1423.726", title: "Ata de processo de licitação", category: "Atas", date: "08/04/2026" },
  { id: "ATA - 1537/1423.726", title: "Ata de processo de licitação", category: "Atas", date: "08/04/2026" },
  { id: "ATA - 1537/1423.726", title: "Ata de processo de licitação", category: "Atas", date: "08/04/2026" },
];

interface AtasTableProps {
  onVerTodas?: () => void;
}

export function AtasTable({ onVerTodas }: AtasTableProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">

        <div className="mb-8">
          <h2 style={{ color: "#111827", fontSize: "1.75rem", fontWeight: 700 }} className="mb-2">
            Últimas Atas publicadas
          </h2>
          <p className="text-gray-400 text-sm">
            Confira as Atas mais recentes disponíveis no sistema
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full max-w-5xl">
          <div className="grid grid-cols-12 px-6 py-4 border-b border-gray-100 text-left">
            <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nº da ATA</div>
            <div className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Título</div>
            <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</div>
            <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</div>
            <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</div>
          </div>

          {atas.map((ata, i) => (
            <div
              key={i}
              className="grid grid-cols-12 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors items-center text-left"
            >
              <div className="col-span-3">
                <span className="text-gray-800 text-sm font-medium">{ata.id}</span>
              </div>
              <div className="col-span-4">
                <span className="text-gray-500 text-sm">{ata.title}</span>
              </div>
              <div className="col-span-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {ata.category}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 text-sm">{ata.date}</span>
              </div>
              <div className="col-span-1 flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800" title="Visualizar">
                  <Eye size={15} />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800" title="Baixar">
                  <Download size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onVerTodas}
          className="mt-8 flex items-center gap-2 text-gray-700 text-sm px-6 py-3 rounded-xl border border-gray-200 hover:bg-white transition-colors"
        >
          Ver todas as atas
          <ArrowRight size={15} />
        </button>
      </div>
    </section>
  );
}
