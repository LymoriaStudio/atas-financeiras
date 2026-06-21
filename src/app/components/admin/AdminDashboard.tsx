import { useEffect, useState } from "react";
import { FileText, BarChart2, Gavel, TrendingUp, Clock, Upload } from "lucide-react";
import {
  Download,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";
import { getAtas, type Ata } from "../../../lib/api/atasService";
import { getCategorias, type Categoria } from "../../../lib/api/categoriasService";

const catStyle: Record<string, { bg: string; text: string }> = {
  Atas:       { bg: "#EFF6FF", text: "#1D4ED8" },
  Financeiro: { bg: "#F0FDF4", text: "#15803D" },
  Estatuto:   { bg: "#FDF4FF", text: "#7E22CE" },
};

// mantido mockado — ainda não há serviço de atividades
const activity = [
  { action: "Ata publicada", doc: "Balanço Semestral – Junho 2026", time: "Há 2 dias" },
  { action: "Documento editado", doc: "Regimento Interno Atualizado", time: "Há 5 dias" },
  { action: "Nova ata adicionada", doc: "Ata de Reunião – Aprovação de Orçamento", time: "Há 1 semana" },
  { action: "Categoria alterada", doc: "Relatório de Auditoria Interna", time: "Há 2 semanas" },
];

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

export function AdminDashboard() {
  const navigate = useNavigate();

  const [atas, setAtas] = useState<Ata[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    setLoading(true);
    const [atasRes, catsRes] = await Promise.all([getAtas(), getCategorias()]);
    if (!atasRes.error && atasRes.data) setAtas(atasRes.data);
    if (!catsRes.error && catsRes.data) setCategorias(catsRes.data);
    setLoading(false);
  }

  const totalAtas = atas.length;
  const totalCategorias = categorias.length;
  const totalDownloads = atas.reduce((sum, a) => sum + (a.downloads_count ?? 0), 0);

  const categoriaNomeMap = Object.fromEntries(categorias.map((c) => [c.id, c.name]));

  const recent = [...atas]
    .sort((a, b) => new Date(b.criado_em ?? 0).getTime() - new Date(a.criado_em ?? 0).getTime())
    .slice(0, 5);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm text-left animate-fade-in">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-slate-900">Painel de Controle de Governança</h2>
          <p className="text-xs text-slate-500">Consulte atas e rascunhos cadastrados, acompanhe fluxos e faça a gestão simplificada de documentos.</p>
        </div>
        <div className="shrink-0">
          <button
            id="btn-nova-ata-banner-dashboard"
            onClick={() => navigate("/admin/atas")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer hover:shadow-blue-600/10 transform hover:-translate-y-0.1 active:translate-y-0"
          >
            <span>Visualizar Atas</span>
          </button>
        </div>
      </div>

      {/* 4 INDICATORS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* INDICATOR: TOTAL DE ATAS */}
        <div id="stat-atas" className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total de Atas</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "—" : totalAtas}
              </h3>
            </div>
          </div>
          <div className="w-20 pt-8 opacity-70">
            <svg viewBox="0 0 100 30" width="100%" height="30" fill="none" strokeWidth="2.5" stroke="#2563eb" strokeLinecap="round">
              <path d="M0 25 L15 18 L30 22 L45 10 L60 15 L75 5 L90 2 L100 12" />
            </svg>
          </div>
        </div>

        {/* INDICATOR: CATEGORIAS */}
        <div id="stat-categorias" className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-slate-50 text-slate-700 rounded-lg flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Categorias</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "—" : totalCategorias}
              </h3>
            </div>
          </div>
          <div className="w-20 pt-8 opacity-70">
            <svg viewBox="0 0 100 30" width="100%" height="30" fill="none" strokeWidth="2.5" stroke="#475569" strokeLinecap="round">
              <path d="M0 25 L20 20 L40 26 L60 12 L80 18 L100 5" />
            </svg>
          </div>
        </div>

        {/* INDICATOR: DOWNLOADS */}
        <div id="stat-downloads" className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Downloads</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "—" : totalDownloads}
              </h3>
            </div>
          </div>
          <div className="w-20 pt-8 opacity-70">
            <svg viewBox="0 0 100 30" width="100%" height="30" fill="none" strokeWidth="2.5" stroke="#10b981" strokeLinecap="round">
              <path d="M0 20 L15 25 L30 18 L45 22 L60 12 L75 16 L90 2 M100 10" />
            </svg>
          </div>
        </div>

        {/* INDICATOR: USUARIOS ACTIVES — mockado (sem serviço ainda) */}
        {/* <div id="stat-usuarios" className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Usuários</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">12</h3>
            </div>
            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4 este mês</span>
            </p>
          </div>
          <div className="w-20 pt-8 opacity-70">
            <svg viewBox="0 0 100 30" width="100%" height="30" fill="none" strokeWidth="2.5" stroke="#2563eb" strokeLinecap="round">
              <path d="M0 26 L20 22 L40 24 L60 15 L80 18 L100 5" />
            </svg>
          </div>
        </div> */}

      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent docs */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p style={{ color: "#111827", fontWeight: 600, fontSize: "0.9rem" }}>Documentos recentes</p>
            <span className="text-xs text-gray-400">Últimas publicações</span>
          </div>
          <div>
            {loading ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">Carregando...</div>
            ) : recent.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">Nenhuma ata cadastrada ainda.</div>
            ) : (
              recent.map((r) => {
                const categoriaNome = categoriaNomeMap[r.categoria_id] ?? "Sem categoria";
                const cs = catStyle[categoriaNome] ?? { bg: "#F3F4F6", text: "#374151" };
                return (
                  <div key={r.id} className="flex items-center justify-between px-6 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-800 text-sm font-medium truncate">{r.titulo}</p>
                        <p className="text-gray-400 text-xs">{r.numero}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: cs.bg, color: cs.text }}>
                        {categoriaNome}
                      </span>
                      <span className="text-gray-400 text-xs hidden sm:block">{formatDate(r.criado_em)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Activity feed — mockado (sem serviço de atividades ainda) */}
        {/* <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p style={{ color: "#111827", fontWeight: 600, fontSize: "0.9rem" }}>Atividade recente</p>
          </div>
          <div className="px-6 py-4 space-y-5">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Clock size={13} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-700 text-xs font-medium">{a.action}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-snug">{a.doc}</p>
                  <p className="text-gray-300 text-xs mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-6 mb-6 mt-2 p-4 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center text-center gap-2">
            <Upload size={18} className="text-gray-400" />
            <p className="text-gray-500 text-xs font-medium">Adicionar novo documento</p>
            <p className="text-gray-300 text-xs">Clique em "Atas" no menu lateral</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}