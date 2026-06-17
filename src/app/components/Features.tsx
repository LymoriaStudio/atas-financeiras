import { ShieldCheck, FolderOpen, Zap } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck size={22} />,
    title: "Transparência",
    description: "Acesso fácil e claro a todas as informações financeiras",
  },
  {
    icon: <FolderOpen size={22} />,
    title: "Organização",
    description: "Documentos estruturados e sempre atualizados",
  },
  {
    icon: <Zap size={22} />,
    title: "Acesso rápido",
    description: "Encontre o que precisa em poucos cliques",
  },
];

export function Features() {
  return (
    <section id="sobre" className="bg-white py-14 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">

        <div className="max-w-2xl mb-12">
          <h2 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700 }} className="mb-3">
            Sobre o Portal de Transparência
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            O Portal de Transparência da SBS Participações tem como objetivo tornar públicas
            as informações financeiras e institucionais da organização. Aqui você encontra
            atas, balanços, estatutos e demais documentos de forma organizada e acessível,
            promovendo a cultura da transparência e o acesso livre à informação.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#F3F4F6", color: "#111827" }}
              >
                {f.icon}
              </div>
              <div>
                <p className="text-gray-900 font-semibold text-sm mb-1">{f.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
