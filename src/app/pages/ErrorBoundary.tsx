import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import logo from "../../imports/sbslogo.png";

const GRADIENT = "linear-gradient(to right, #4F46A0, #E8926B)";

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const is404 = isRouteErrorResponse(error) && error.status === 404;

  const title = is404 ? "Página não encontrada" : "Ops! Algo deu errado";
  const description = is404
    ? "O endereço que você tentou acessar não existe ou foi movido."
    : "Ocorreu um erro inesperado. Tente novamente ou volte para o início.";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Glow decorativo */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{ background: GRADIENT, filter: "blur(140px)" }}
      />

      <div className="relative z-10 max-w-lg w-full mx-6 text-center">
        <img src={logo} alt="" className="h-10 w-auto mx-auto mb-10 opacity-90" />

        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <AlertTriangle size={28} className="text-white" />
        </div>

        {is404 && (
          <p className="text-7xl font-black text-white/10 leading-none mb-1 select-none">404</p>
        )}

        <h1 className="text-white text-3xl md:text-4xl font-bold mb-3">{title}</h1>
        <p className="text-gray-300 text-base leading-relaxed mb-8">{description}</p>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-900 px-7 py-3.5 rounded-lg hover:opacity-90 transition-all duration-300 text-sm font-semibold shadow-lg"
            style={{ backgroundColor: "#ffffff" }}
          >
            <Home size={16} />
            Voltar para o início
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-white border border-white/40 px-7 py-3.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-semibold"
          >
            <RefreshCw size={16} />
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  );
}
