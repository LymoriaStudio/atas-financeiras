import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react";
import sbsLogo from "../../imports/sbslogo.png";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router";
import { getAtas } from "../../lib/api/atasService";
import { getCategorias } from "../../lib/api/categoriasService";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Estatísticas reais para o painel lateral
  const [atasCount, setAtasCount] = useState<number | null>(null);
  const [categoriasCount, setCategoriasCount] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    getAtas().then(({ data }) => {
      if (data) setAtasCount(data.length);
    });

    getCategorias().then(({ data }) => {
      if (data) setCategoriasCount(data.length);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("E-mail ou senha incorretos.");
        return;
      }

      // login OK → vai para admin
      navigate("/admin", { replace: true });
    } catch {
      setError("Erro inesperado ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear().toString();

  const stats: [string, string][] = [
    [atasCount !== null ? atasCount.toString() : "...", "Atas publicadas"],
    [categoriasCount !== null ? categoriasCount.toString() : "...", "Categorias"],
    [currentYear, "Ano atual"],
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F9FAFB" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12"
        style={{ backgroundColor: "#111827" }}
      >
        <div>
          <img src={sbsLogo} alt="SBS Participações" style={{ height: "48px" }} />
        </div>

        <div>
          <h2
            className="text-white mb-3"
            style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.2 }}
          >
            Painel de
            <br />
            Administração
          </h2>

          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Gerencie atas, documentos financeiros e estatutos do Portal de Transparência.
          </p>
        </div>

        <div className="flex gap-6">
          {stats.map(([val, label]) => (
            <div key={label}>
              <p className="text-white font-bold" style={{ fontSize: "1.5rem" }}>
                {val}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-8">
        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-10 transition-colors"
          >
            <ArrowLeft size={15} />
            Voltar ao portal
          </button>

          <h1 className="mb-1" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
            Entrar no painel
          </h1>

          <p className="text-gray-400 text-sm mb-8">
            Use suas credenciais de administrador
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                E-mail
              </label>

              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sbs.com.br"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Senha
              </label>

              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />

                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ backgroundColor: "#111827" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* <p className="text-center text-gray-400 text-xs mt-8">
            Credenciais demo:{" "}
            <span className="text-gray-600 font-medium">admin@sbs.com.br</span> /{" "}
            <span className="text-gray-600 font-medium">admin123</span>
          </p> */}
        </div>
      </div>
    </div>
  );
}