import { useEffect, useState } from "react";
import { FileText, BarChart2, Gavel, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { getAtas, type Ata } from "../../../lib/api/atasService";

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

// Atividade mockada — sem serviço ainda
const activity = [
  { action: "Ata publicada",        doc: "Balanço Semestral – Junho 2026",              time: "Há 2 dias" },
  { action: "Documento editado",    doc: "Regimento Interno Atualizado",                time: "Há 5 dias" },
  { action: "Nova ata adicionada",  doc: "Ata de Reunião – Aprovação de Orçamento",    time: "Há 1 semana" },
  { action: "Categoria alterada",   doc: "Relatório de Auditoria Interna",              time: "Há 2 semanas" },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [atas, setAtas] = useState<Ata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const res = await getAtas();
    if (!res.error && res.data) setAtas(res.data);
    setLoading(false);
  }

  const total      = atas.length;
  const financeiro = atas.filter((a) => (a as any).tipo === "Financeiro").length;
  const atasCount  = atas.filter((a) => (a as any).tipo === "Atas").length;
  const estatuto   = atas.filter((a) => (a as any).tipo === "Estatuto").length;

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

  const recent = [...atas]
    .sort((a, b) => new Date(b.criado_em ?? 0).getTime() - new Date(a.criado_em ?? 0).getTime())
    .slice(0, 5);

  const CARDS = [
    {
      label: "Total de Documentos",
      value: total,
      icon: <FileText className="w-5 h-5" />,
      iconBg: "#F1F5F9",
      iconColor: "#475569",
      sub: `+${Math.max(0, total)} cadastrados`,
      subColor: "#10B981",
      spark: "#475569",
      sparkPath: "M0 25 L15 18 L30 22 L45 10 L60 15 L75 5 L90 2 L100 12",
    },
    {
      label: "Financeiros",
      value: financeiro,
      icon: <BarChart2 className="w-5 h-5" />,
      iconBg: "#F0FDF4",
      iconColor: "#22C55E",
      sub: `${pct(financeiro)}% do total`,
      subColor: "#10B981",
      spark: "#22C55E",
      sparkPath: "M0 25 L20 20 L40 26 L60 12 L80 18 L100 5",
    },
    {
      label: "Atas",
      value: atasCount,
      icon: <FileText className="w-5 h-5" />,
      iconBg: "#EFF6FF",
      iconColor: "#3B82F6",
      sub: `${pct(atasCount)}% do total`,
      subColor: "#3B82F6",
      spark: "#3B82F6",
      sparkPath: "M0 22 L15 15 L30 20 L45 8 L60 14 L75 4 L90 10 L100 2",
    },
    {
      label: "Estatutos",
      value: estatuto,
      icon: <Gavel className="w-5 h-5" />,
      iconBg: "#FDF4FF",
      iconColor: "#A855F7",
      sub: `${pct(estatuto)}% do total`,
      subColor: "#A855F7",
      spark: "#A855F7",
      sparkPath: "M0 28 L20 22 L40 26 L60 18 L80 20 L100 8",
    },
  ];

  return (
    <div className="p-4 space-y-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm mt-0.5">
            Visão geral do Portal de{" "}
            <span style={{ color: "#F97316" }}>Transparência</span>
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/atas")}
          className="flex cursor-pointer items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: "#111827" }}
        >
          Visualizar Atas
        </button>
      </div>

      {/* 4 Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
  {CARDS.map((card) => (
    <div
      key={card.label}
      className="bg-white flex gap-4 items-start rounded-2xl border border-gray-100 shadow-sm p-5"
    >
      {/* Ícone + label */}
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

      {/* Número */}
      <p className="text-4xl font-bold text-gray-900 mb-3">
        {loading ? "—" : card.value}
      </p>

      {/* Subtexto */}
      <p className="text-xs font-medium flex items-center gap-1" style={{ color: card.subColor }}>
        <TrendingUp size={12} />
        {card.sub}
      </p>
           </div>
    </div>
  ))}
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