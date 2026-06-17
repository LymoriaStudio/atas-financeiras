import { Search, ChevronRight } from "lucide-react";
import bannerPhoto from "../../imports/banner-hero.webp";

const GRADIENT = "linear-gradient(to right, #4F46A0, #E8926B)";

export function Hero() {
  return (
    <section
      className="relative pt-16 min-h-screen overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Imagem de fundo cobrindo todo o hero */}
      <img
        src={bannerPhoto}
        alt="Profissional sorrindo em ambiente corporativo arborizado"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Layer 3 — escurece o topo para a navbar */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "140px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
        }}
      />

      {/* Layer 4 — gradiente suave da esquerda para a direita (zona de texto) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.80) 25%, rgba(0,0,0,0.50) 45%, rgba(0,0,0,0.15) 62%, transparent 78%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 min-h-screen flex items-center">
        <div className="max-w-xl py-28">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span
              className="text-white text-xs font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              Portal de Transparência
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-white mb-5"
            style={{ fontSize: "3.5rem", fontWeight: 700, lineHeight: 1.15 }}
          >
            Transparência que <br />
            gera{" "}
            <span style={{ fontWeight: 900, color: "#ffffff" }}>
              confiança
            </span>
          </h1>

          <p className="text-gray-300 text-lg mb-10 leading-relaxed">
            Consulte atas, documentos e registros financeiros de forma
            organizada, rápida e segura
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              className="flex items-center gap-2 text-gray-900 px-7 py-3.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold shadow-lg"
              style={{ backgroundColor: "#ffffff" }}
            >
              <Search size={16} />
              Consultar Atas
            </button>
            <button className="flex items-center gap-2 text-white border border-white/40 px-7 py-3.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-semibold">
              Saiba mais
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
