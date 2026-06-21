import { Search, ChevronRight } from "lucide-react";

import bannerDesktop from "../../media/hero/web_hero_ver.png";
import bannerTablet from "../../media/hero/tablet_her_ver.png";
import bannerMobile from "../../media/hero/mobile_hero_ver.png";

const GRADIENT = "linear-gradient(to right, #4F46A0, #E8926B)";

export function Hero() {
  return (
    <section
      id="home"
      className="relative pt-16 min-h-screen overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Imagem de fundo responsiva */}
      <picture>
        <source
          media="(min-width: 1024px)"
          srcSet={bannerDesktop}
        />

        <source
          media="(min-width: 768px)"
          srcSet={bannerTablet}
        />

        <img
          src={bannerMobile}
          alt="Profissional sorrindo em ambiente corporativo arborizado"
          className="
            absolute inset-0
            w-full h-full
            object-cover
            object-[70%_center]
            md:object-center
          "
        />
      </picture>

      {/* Escurece o topo */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "140px",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
        }}
      />

      {/* Gradiente lateral */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.80) 25%, rgba(0,0,0,0.50) 45%, rgba(0,0,0,0.15) 62%, transparent 78%)",
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 min-h-screen flex items-center">
        <div className="max-w-xl py-28">
          <div className="inline-flex items-center gap-2 mb-6">
            <span
              className="text-white text-xs font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              Portal de Transparência
            </span>
          </div>

          <h1
            className="
              text-white mb-5
              text-4xl md:text-5xl lg:text-6xl
              font-bold leading-tight
            "
          >
            Transparência que <br />
            gera <span className="font-black">confiança</span>
          </h1>

          <p className="text-gray-300 text-base md:text-lg mb-10 leading-relaxed">
            Consulte atas, documentos e registros financeiros de forma
            organizada, rápida e segura.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                document.getElementById("consultar")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="flex items-center gap-2 text-gray-900 px-7 py-3.5 rounded-lg hover:opacity-90 transition-all duration-300 text-sm font-semibold shadow-lg"
              style={{ backgroundColor: "#ffffff" }}
            >
              <Search size={16} />
              Consultar Atas
            </button>

            <button
              onClick={() => {
                document.getElementById("sobre")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="flex items-center gap-2 text-white border border-white/40 px-7 py-3.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-semibold"
            >
              Saiba mais
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}