import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  BarChart2, FileText, Gavel, Users, Building2, Calendar, Briefcase,
  Landmark, ClipboardList, Scale, Shield, Archive, BookOpen, DollarSign,
  TrendingUp, Star, Check, Loader2, ArrowLeft,
} from "lucide-react";
import { createCategoria } from "../../../lib/api/categoriasService";
import { logAtividade } from "../../../lib/api/atividadesService";
import type { Usuario } from "../../../lib/api/usuarioService";

const ICONS = [
  "BarChart2","FileText","Gavel","Users","Building2","Calendar",
  "Briefcase","Landmark","ClipboardList","Scale","Shield","Archive",
  "BookOpen","DollarSign","TrendingUp","Star",
];

const iconMap: Record<string, React.ReactNode> = {
  BarChart2: <BarChart2 size={22} />, FileText: <FileText size={22} />,
  Gavel: <Gavel size={22} />, Users: <Users size={22} />,
  Building2: <Building2 size={22} />, Calendar: <Calendar size={22} />,
  Briefcase: <Briefcase size={22} />, Landmark: <Landmark size={22} />,
  ClipboardList: <ClipboardList size={22} />, Scale: <Scale size={22} />,
  Shield: <Shield size={22} />, Archive: <Archive size={22} />,
  BookOpen: <BookOpen size={22} />, DollarSign: <DollarSign size={22} />,
  TrendingUp: <TrendingUp size={22} />, Star: <Star size={22} />,
};

const COLORS = [
  "#15803D","#1D4ED8","#7E22CE","#B45309","#DC2626","#111827",
  "#0891B2","#65A30D","#C026D3","#EA580C","#0EA5E9","#475569",
];

export function AdminNovaCategoria() {
  const navigate = useNavigate();
  const { usuario } = useOutletContext<{ usuario: Usuario | null }>();

  // Viewer não pode criar categorias — redireciona de volta
  useEffect(() => {
    if (usuario && usuario.role === "viewer") {
      navigate("/admin/categorias");
    }
  }, [usuario, navigate]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("FileText");
  const [color, setColor] = useState("#111827");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true); setErrorMsg(null);

    const { data, error } = await createCategoria({ name, description, icon, color, count: 0 });

    if (error || !data) {
      setErrorMsg("Erro ao criar categoria. Tente novamente.");
      setSubmitting(false);
      return;
    }

    logAtividade("criou uma categoria", data.name);
    setSubmitting(false);
    setSaved(true);
    setTimeout(() => navigate("/admin/categorias"), 700);
  };

  if (usuario?.role === "viewer") return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={() => navigate("/admin/categorias")}
          className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200/60 rounded-xl transition-all"
          title="Voltar para a listagem"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ color: "#111827", fontSize: "1.25rem", fontWeight: 700 }}>Nova Categoria</h1>
          <p className="text-gray-400 text-sm mt-1">Cadastre uma nova categoria de classificação</p>
        </div>
      </div>

      {errorMsg && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{errorMsg}</div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Financeiro"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-lg text-sm text-gray-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Descrição</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Quais documentos pertencem a esta categoria..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-lg text-sm text-gray-700 focus:outline-none resize-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Ícone</label>
            <div className="grid grid-cols-8 md:grid-cols-[repeat(16,minmax(0,1fr))] gap-1.5">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  title={ic}
                  className="h-8 rounded-lg border flex items-center justify-center transition-all"
                  style={icon === ic
                    ? { borderColor: color, backgroundColor: `${color}15`, color: color }
                    : { borderColor: "#E5E7EB", color: "#9CA3AF" }}
                >
                  <span style={{ transform: "scale(0.65)", display: "flex" }}>{iconMap[ic]}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cor de destaque</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  title={c}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                    transform: color === c ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {color === c && <Check size={13} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Pré-visualização</label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15`, color: color }}>
                {iconMap[icon] ?? <FileText size={20} />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{name || "Nome da categoria"}</p>
                <p className="text-xs text-gray-400 truncate">{description || "Descrição da categoria"}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/categorias")}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-6 py-2.5 text-sm font-bold flex items-center justify-center gap-2"
              style={saved ? { backgroundColor: "#15803D" } : undefined}
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : saved ? <><Check size={15} /> Criada!</> : "Registrar Categoria"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
