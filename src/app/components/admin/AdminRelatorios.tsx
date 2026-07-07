import { useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, FileCheck, Activity, Loader2 } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { getAtas, type Ata } from "../../../lib/api/atasService";
import { getCategorias, type Categoria } from "../../../lib/api/categoriasService";
import { getUsuarios, type Usuario } from "../../../lib/api/usuarioService";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const ROLE_LABEL: Record<string, string> = { admin: "Admin", editor: "Editor", viewer: "Viewer" };

function toArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.length) return [raw];
  return [];
}

type ReportTab = "periodo" | "categoria" | "downloads" | "usuarios";

export function AdminRelatorios() {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ReportTab>("periodo");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [atasRes, catRes, userRes] = await Promise.all([getAtas(), getCategorias(), getUsuarios()]);
      setAtas(atasRes.data ?? []);
      setCategorias(catRes.data ?? []);
      setUsuarios(userRes.data ?? []);
      setLoading(false);
    })();
  }, []);

  const totalDownloads = useMemo(
    () => atas.reduce((acc, a) => acc + ((a as any).downloads_count ?? 0), 0),
    [atas]
  );

  const selectedYear = new Date().getFullYear();

  const periodoData = useMemo(() => MESES.map((mes, i) => ({
    mes,
    Publicado: atas.filter((a) => {
      const d = new Date(`${a.data}T00:00:00`);
      return d.getMonth() === i && d.getFullYear() === selectedYear && a.status === "Publicado";
    }).length,
    Rascunho: atas.filter((a) => {
      const d = new Date(`${a.data}T00:00:00`);
      return d.getMonth() === i && d.getFullYear() === selectedYear && a.status === "Rascunho";
    }).length,
  })), [atas, selectedYear]);

  const categoriaData = useMemo(() => {
    const counts: Record<string, number> = {};
    atas.forEach((a) => toArray((a as any).categoria_id).forEach((id) => { counts[id] = (counts[id] ?? 0) + 1; }));
    return categorias
      .map((c) => ({ name: c.name, value: counts[c.id] ?? 0, color: c.color }))
      .filter((c) => c.value > 0);
  }, [atas, categorias]);

  const downloadsData = useMemo(
    () => [...atas]
      .sort((a, b) => ((b as any).downloads_count ?? 0) - ((a as any).downloads_count ?? 0))
      .slice(0, 8)
      .map((a) => ({ name: a.titulo?.length > 18 ? `${a.titulo.slice(0, 18)}…` : a.titulo, downloads: (a as any).downloads_count ?? 0 })),
    [atas]
  );

  const usuariosData = useMemo(() => (["admin", "editor", "viewer"] as const).map((r) => ({
    name: ROLE_LABEL[r],
    count: usuarios.filter((u) => u.role === r).length,
  })), [usuarios]);

  function handleExportCsv() {
    let csv = `RELATÓRIO: ${tab.toUpperCase()}\nExportado em: ${new Date().toLocaleString("pt-BR")}\n\n`;
    if (tab === "periodo") {
      csv += "Mês,Publicado,Rascunho\n";
      periodoData.forEach((r) => { csv += `${r.mes},${r.Publicado},${r.Rascunho}\n`; });
    } else if (tab === "categoria") {
      csv += "Categoria,Atas\n";
      categoriaData.forEach((r) => { csv += `${r.name},${r.value}\n`; });
    } else if (tab === "downloads") {
      csv += "Ata,Downloads\n";
      downloadsData.forEach((r) => { csv += `${r.name},${r.downloads}\n`; });
    } else {
      csv += "Perfil,Quantidade\n";
      usuariosData.forEach((r) => { csv += `${r.name},${r.count}\n`; });
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_${tab}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleExportSummary() {
    let txt = `SISTEMA DE GESTÃO DE ATAS — RELATÓRIO SINTÉTICO (${tab.toUpperCase()})\n`;
    txt += `Gerado em: ${new Date().toLocaleString("pt-BR")}\n`;
    txt += `-----------------------------------------------------\n\n`;
    txt += `Atas ativas: ${atas.length}\n`;
    txt += `Downloads totais: ${totalDownloads}\n`;
    txt += `Categorias: ${categorias.length}\n`;
    txt += `Usuários: ${usuarios.length}\n`;
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_sintetico_${tab}_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const TABS: { key: ReportTab; label: string }[] = [
    { key: "periodo", label: "Atas por Período" },
    { key: "categoria", label: "Atas por Categoria" },
    { key: "downloads", label: "Downloads Realizados" },
    { key: "usuarios", label: "Usuários Ativos" },
  ];

  if (loading) {
    return (
      <div className="p-4">
        <div className="py-16 flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Loader2 size={16} className="animate-spin" /> Carregando relatórios...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700 }}>Relatórios</h1>
          <p className="text-gray-400 text-sm mt-1">Gere relatórios e gráficos a partir dos dados reais do sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCsv} className="flex items-center gap-1.5 px-3 py-2 border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all">
            <FileSpreadsheet size={16} /> Exportar CSV
          </button>
          <button onClick={handleExportSummary} className="flex items-center gap-1.5 px-3.5 py-2 border border-red-100 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-all">
            <FileCheck size={16} /> Relatório Sintético
          </button>
        </div>
      </div>

      <div className="bg-white p-2.5 rounded-xl flex flex-wrap gap-2 border border-gray-100 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${tab === t.key ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-50">
            <h4 className="text-base font-bold text-gray-900">{TABS.find((t) => t.key === tab)?.label}</h4>
            <Activity size={18} className="text-blue-500" />
          </div>
          <div className="h-80 pt-3">
            {tab === "periodo" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="mes" fontSize={11} stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: "1px solid #f3f4f6" }} />
                  <Bar dataKey="Publicado" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Rascunho" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {tab === "categoria" && (
              categoriaData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Nenhuma ata categorizada ainda.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoriaData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value" nameKey="name">
                      {categoriaData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )
            )}
            {tab === "downloads" && (
              downloadsData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Nenhum download registrado ainda.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={downloadsData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" fontSize={11} stroke="#9ca3af" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" fontSize={11} stroke="#9ca3af" width={140} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="downloads" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              )
            )}
            {tab === "usuarios" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usuariosData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" fontSize={11} stroke="#9ca3af" />
                  <YAxis fontSize={11} stroke="#9ca3af" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Métricas Gerais</h4>
            <div className="space-y-2.5 text-xs font-semibold">
              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                <span className="text-gray-500 font-medium">Atas ativas</span>
                <span className="text-gray-900 font-bold">{atas.length}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                <span className="text-gray-500 font-medium">Downloads totais</span>
                <span className="text-emerald-700 font-bold">+{totalDownloads.toLocaleString("pt-BR")}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                <span className="text-gray-500 font-medium">Usuários</span>
                <span className="text-gray-900 font-bold">{usuarios.length}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                <span className="text-gray-500 font-medium">Categorias</span>
                <span className="text-blue-600 font-bold">{categorias.length}</span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800 font-medium leading-relaxed">
            <p className="text-sm font-bold text-blue-700">Resumo do Sistema</p>
            <p className="text-xs text-blue-600 mt-1">
              {atas.length} atas cadastradas em {categorias.length} categorias. {atas.filter((a) => a.status === "Publicado").length} publicadas e {atas.filter((a) => a.status === "Rascunho").length} em rascunho.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
