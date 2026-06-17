import { FileText, BarChart2, Gavel, TrendingUp, Clock, Upload } from "lucide-react";

const stats = [
  { label: "Total de Documentos", value: "18", sub: "+3 este mês", icon: <FileText size={20} />, color: "#111827" },
  { label: "Documentos Financeiros", value: "7", sub: "38% do total", icon: <BarChart2 size={20} />, color: "#15803D" },
  { label: "Atas", value: "8", sub: "44% do total", icon: <FileText size={20} />, color: "#1D4ED8" },
  { label: "Estatutos", value: "3", sub: "18% do total", icon: <Gavel size={20} />, color: "#7E22CE" },
];

const recent = [
  { id: "ATA - 0018/2026.018", title: "Balanço Semestral – Junho 2026", category: "Financeiro", date: "20/05/2026", status: "Publicado" },
  { id: "ATA - 0017/2026.017", title: "Regimento Interno Atualizado", category: "Estatuto", date: "12/05/2026", status: "Publicado" },
  { id: "ATA - 0016/2026.016", title: "Ata de Reunião – Aprovação de Orçamento", category: "Atas", date: "05/05/2026", status: "Publicado" },
  { id: "ATA - 0015/2026.015", title: "Relatório de Auditoria Interna", category: "Financeiro", date: "30/04/2026", status: "Publicado" },
  { id: "ATA - 0014/2026.014", title: "Ata da Assembleia Geral Extraordinária", category: "Atas", date: "22/04/2026", status: "Publicado" },
];

const catStyle: Record<string, { bg: string; text: string }> = {
  Atas:       { bg: "#EFF6FF", text: "#1D4ED8" },
  Financeiro: { bg: "#F0FDF4", text: "#15803D" },
  Estatuto:   { bg: "#FDF4FF", text: "#7E22CE" },
};

const activity = [
  { action: "Ata publicada", doc: "Balanço Semestral – Junho 2026", time: "Há 2 dias" },
  { action: "Documento editado", doc: "Regimento Interno Atualizado", time: "Há 5 dias" },
  { action: "Nova ata adicionada", doc: "Ata de Reunião – Aprovação de Orçamento", time: "Há 1 semana" },
  { action: "Categoria alterada", doc: "Relatório de Auditoria Interna", time: "Há 2 semanas" },
];

export function AdminDashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700 }}>Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Visão geral do Portal de Transparência</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}10`, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">{s.label}</p>
              <p style={{ color: "#111827", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
              <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                <TrendingUp size={11} />
                {s.sub}
              </p>
            </div>
          </div>
        ))}
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
            {recent.map((r, i) => {
              const cs = catStyle[r.category] ?? { bg: "#F3F4F6", text: "#374151" };
              return (
                <div key={i} className="flex items-center justify-between px-6 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-800 text-sm font-medium truncate">{r.title}</p>
                      <p className="text-gray-400 text-xs">{r.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: cs.bg, color: cs.text }}>{r.category}</span>
                    <span className="text-gray-400 text-xs hidden sm:block">{r.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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

          {/* Quick upload CTA */}
          <div className="mx-6 mb-6 mt-2 p-4 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center text-center gap-2">
            <Upload size={18} className="text-gray-400" />
            <p className="text-gray-500 text-xs font-medium">Adicionar novo documento</p>
            <p className="text-gray-300 text-xs">Clique em "Atas" no menu lateral</p>
          </div>
        </div>
      </div>
    </div>
  );
}
