import { useEffect, useState } from "react";
import { FileText, Clock, TrendingUp, Download, CheckCircle, FolderOpen, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import { getAtas, type Ata } from "../../../lib/api/atasService";
import { getCategorias, type Categoria } from "../../../lib/api/categoriasService";

function formatDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function getTipoStyle(tipo: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    Atas:       { bg: "#EFF6FF", text: "#1D4ED8" },
    Financeiro: { bg: "#F0FDF4", text: "#15803D" },
    Estatuto:   { bg: "#FDF4FF", text: "#7E22CE" },
  };
  return map[tipo] ?? { bg: "#F3F4F6", text: "#374151" };
}

function getCatColorHex(color: string): string {
  // color já vem como hex direto do banco (#15803D)
  if (color?.startsWith("#")) return color;
  return "#94A3B8";
}

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const activity = [
  { action: "Ata publicada",        doc: "Balanço Semestral – Junho 2026",           time: "Há 2 dias" },
  { action: "Documento editado",    doc: "Regimento Interno Atualizado",             time: "Há 5 dias" },
  { action: "Nova ata adicionada",  doc: "Ata de Reunião – Aprovação de Orçamento", time: "Há 1 semana" },
  { action: "Categoria alterada",   doc: "Relatório de Auditoria Interna",           time: "Há 2 semanas" },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [atas, setAtas] = useState<Ata[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<"Este ano" | "Ano anterior">("Este ano");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [atasRes, catsRes] = await Promise.all([getAtas(), getCategorias()]);
    if (!atasRes.error && atasRes.data) setAtas(atasRes.data);
    if (!catsRes.error && catsRes.data) setCategorias(catsRes.data);
    setLoading(false);
  }

  const total      = atas.length;
  const publicadas = atas.filter((a) => a.status === "Publicado").length;
  const downloads  = atas.reduce((acc, a) => acc + (a.downloads_count ?? 0), 0);
  const totalCats  = categorias.length;

  const recent = [...atas]
    .sort((a, b) => new Date(b.criado_em ?? 0).getTime() - new Date(a.criado_em ?? 0).getTime())
    .slice(0, 5);

  // ── Gráfico de barras: atas por mês ──────────────────────────────────────
  const currentYear = new Date().getFullYear();
  const filterYear  = yearFilter === "Este ano" ? currentYear : currentYear - 1;

  const monthlyData = MONTHS.map((month, i) => ({
    month,
    publicadas: atas.filter((a) => {
      if (!a.criado_em) return false;
      const d = new Date(a.criado_em);
      return d.getFullYear() === filterYear && d.getMonth() === i;
    }).length,
  }));

  // ── Gráfico de rosca: atas por categoria ─────────────────────────────────
  const totalAtasCount = atas.length;

  const categoryCounts = categorias.map((cat) => {
    const count = atas.filter((a) => Array.isArray((a as any).categoria_id) ? (a as any).categoria_id.includes(cat.id) : (a as any).categoria_id === cat.id).length;
    return {
      name:       (cat as any).name,
      value:      count,
      color:      (cat as any).color ?? "#94A3B8",
      percentage: totalAtasCount > 0 ? Math.round((count / totalAtasCount) * 100) : 0,
    };
  });

  const CARDS = [
    {
      label: "Total de Documentos",
      value: total,
      icon: <FileText className="w-5 h-5" />,
      iconBg: "#F1F5F9",
      iconColor: "#475569",
      sub: `${total} cadastrados`,
      subColor: "#10B981",
    },
    {
      label: "Total de Categorias",
      value: totalCats,
      icon: <FolderOpen className="w-5 h-5" />,
      iconBg: "#FDF4FF",
      iconColor: "#A855F7",
      sub: `${totalCats} categoria${totalCats !== 1 ? "s" : ""} ativa${totalCats !== 1 ? "s" : ""}`,
      subColor: "#A855F7",
    },
    {
      label: "Downloads",
      value: downloads,
      icon: <Download className="w-5 h-5" />,
      iconBg: "#EFF6FF",
      iconColor: "#3B82F6",
      sub: "total de downloads",
      subColor: "#3B82F6",
    },
    {
      label: "Publicados",
      value: publicadas,
      icon: <CheckCircle className="w-5 h-5" />,
      iconBg: "#F0FDF4",
      iconColor: "#22C55E",
      sub: total > 0 ? `${Math.round((publicadas / total) * 100)}% do total` : "0% do total",
      subColor: "#10B981",
    },
  ];

  return (
    <div className="p-4 space-y-8 bg-gray-50 min-h-screen">

      {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm text-left animate-fade-in">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-slate-900">Painel de Controle de Governança</h2>
          <p className="text-xs text-slate-500">Consulte atas e rascunhos cadastrados, acompanhe fluxos e faça a gestão simplificada de documentos.</p>
        </div>
        <div className="shrink-0">
          <button
            id="btn-nova-ata-banner-dashboard"
            onClick={() => navigate('/admin/atas')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer hover:shadow-blue-600/10 transform hover:-translate-y-0.1 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ata</span>
          </button>
        </div>
      </div>
      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {CARDS.map((card) => (
          <div
            key={card.label}
            className="bg-white flex gap-4 items-start rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: card.iconBg, color: card.iconColor }}
              >
                {card.icon}
              </div>
            </div>
            <div>
              <p className="text-[12px] text-gray-400 font-medium">{card.label}</p>
              <p className="text-4xl font-bold text-gray-900 mb-3">
                {loading ? "—" : card.value}
              </p>
              <p className="text-xs font-medium flex items-center gap-1" style={{ color: card.subColor }}>
                <TrendingUp size={12} />
                {card.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Gráficos ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* GRÁFICO 1: Atas publicadas por mês */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">Atas publicadas por mês</h4>
              <p className="text-xs text-slate-400 mt-0.5">Ano em curso</p>
            </div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value as any)}
              className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Este ano">Este ano</option>
              <option value="Ano anterior">Ano anterior</option>
            </select>
          </div>

          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-slate-100 p-2.5 rounded-lg shadow-md text-xs">
                          <p className="font-semibold text-slate-900">{payload[0].payload.month}</p>
                          <p className="text-blue-600 font-bold mt-1">{payload[0].value} atas</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="publicadas" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.month === MONTHS[new Date().getMonth()]
                          ? "#2563eb"
                          : "#93c5fd"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 2: Atas por categoria (rosca) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900">Atas por categoria</h4>
            <p className="text-xs text-slate-400 mt-0.5">Visão consolidada</p>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 py-4">
            <div className="w-36 h-36 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryCounts.length > 0 ? categoryCounts : [{ name: "Sem dados", value: 1, color: "blue", percentage: 0 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(categoryCounts.length > 0 ? categoryCounts : [{ color: "blue" }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCatColorHex(entry.color)} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} Atas`, "Quantidade"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #f1f5f9", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest leading-none font-semibold">Total</span>
                <span className="text-lg font-bold text-slate-900 mt-1">{totalAtasCount.toLocaleString("pt-BR")}</span>
              </div>
            </div>

            <div className="space-y-2 flex-1 w-full text-xs">
              {categoryCounts.map((cat, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: getCatColorHex(cat.color) }} />
                    <span className="text-slate-600 font-medium truncate">{cat.name}</span>
                  </div>
                  <span className="text-slate-400 font-semibold shrink-0">
                    {cat.percentage}% <span className="font-mono text-[10px]">({cat.value})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Documentos recentes */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-gray-900 font-semibold text-sm">Documentos recentes</p>
            <span className="text-xs text-gray-400">Últimas publicações</span>
          </div>
          <div>
            {loading ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">Carregando...</div>
            ) : recent.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">Nenhuma ata cadastrada ainda.</div>
            ) : (
              recent.map((r) => {
                const tipo = (r as any).tipo ?? "";
                const cs = getTipoStyle(tipo);
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-6 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                  >
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
                      {tipo && (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ backgroundColor: cs.bg, color: cs.text }}
                        >
                          {tipo}
                        </span>
                      )}
                      <span className="text-gray-400 text-xs hidden sm:block">{formatDate(r.criado_em)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Atividade recente */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-gray-900 font-semibold text-sm">Atividade recente</p>
          </div>
          <div className="px-6 py-5 space-y-5">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Clock size={13} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-700 text-xs font-semibold">{a.action}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-snug">{a.doc}</p>
                  <p className="text-gray-300 text-xs mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}