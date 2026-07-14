import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, FileText, FolderTree,
  LogOut, Menu, X, ChevronDown, Bell,
  User, KeyRound, Trash2, ShieldCheck, BarChart3, Eye,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { getUsuarioById, type Usuario } from "../../lib/api/usuarioService";
import { getAtividadesRecentes, type Atividade } from "../../lib/api/atividadesService";
import logoSbs from '../../imgs/logosbs.png';

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Agora mesmo";
  if (min < 60) return `Há ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `Há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Há ${days} dia${days > 1 ? "s" : ""}`;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Painel Geral",
    items: [
      { label: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    ],
  },
  {
    title: "Documentos",
    items: [
      { label: "Atas",       path: "/admin/atas",       icon: <FileText className="w-4 h-4" /> },
      { label: "Categorias", path: "/admin/categorias", icon: <FolderTree className="w-4 h-4" /> },
      { label: "Lixeira",    path: "/admin/lixeira",    icon: <Trash2 className="w-4 h-4" /> },
    ],
  },
  {
    title: "Administração",
    items: [
      { label: "Usuários",   path: "/admin/usuarios",   icon: <User className="w-4 h-4" />, adminOnly: true },
      { label: "Permissões", path: "/admin/permissoes", icon: <ShieldCheck className="w-4 h-4" /> },
      { label: "Relatórios", path: "/admin/relatorios", icon: <BarChart3 className="w-4 h-4" /> },
    ],
  },
];

const HEADER_INFO: Record<string, { title: string; subtitle: string }> = {
  "/admin":            { title: "Dashboard",   subtitle: "Bem-vindo de volta!" },
  "/admin/atas":       { title: "Atas",        subtitle: "Gerencie as atas cadastradas" },
  "/admin/atas/nova":  { title: "Nova Ata",    subtitle: "Cadastre uma nova ata" },
  "/admin/categorias": { title: "Categorias",  subtitle: "Organize as categorias de documentos" },
  "/admin/categorias/nova": { title: "Nova Categoria", subtitle: "Cadastre uma nova categoria" },
  "/admin/lixeira":    { title: "Lixeira",     subtitle: "Restaure ou exclua atas removidas" },
  "/admin/usuarios":   { title: "Usuários",    subtitle: "Gerencie os usuários do sistema" },
  "/admin/permissoes": { title: "Permissões",  subtitle: "Veja as permissões por perfil" },
  "/admin/relatorios": { title: "Relatórios",  subtitle: "Acompanhe relatórios e métricas" },
  "/admin/perfil":     { title: "Meu Perfil",  subtitle: "Atualize seus dados pessoais" },
};

const ROLE_LABEL: Record<string, string> = {
  admin:  "Administrador",
  editor: "Editor",
  viewer: "Visualizador",
};


export function AdminPanel() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [usuario,     setUsuario]     = useState<Usuario | null>(null);
  const [notificacoes, setNotificacoes] = useState<Atividade[]>([]);
  const [lidas, setLidas] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("atividades_lidas") ?? "[]"));
    } catch {
      return new Set();
    }
  });

  const header = HEADER_INFO[location.pathname] ?? { title: "Admin", subtitle: "Bem-vindo de volta!" };

  // ── Carrega usuário logado ────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await getUsuarioById(user.id);
      if (data) setUsuario(data);
    }
    load();
  }, []);

  // ── Carrega atividades recentes para o sino de notificações ─────────────
  useEffect(() => {
    async function loadNotificacoes() {
      const { data } = await getAtividadesRecentes(5);
      if (data) setNotificacoes(data);
    }
    loadNotificacoes();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const toggleLida = (id: string) => {
    setLidas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("atividades_lidas", JSON.stringify([...next]));
      return next;
    });
  };

  const closeAll = () => { setProfileOpen(false); setNotifOpen(false); };

  // Iniciais para fallback do avatar
  const initials = (usuario?.full_name ?? "AD")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900">

      {/* SIDEBAR — desktop */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-[#1E293B] text-white">
        <SidebarContent currentPath={location.pathname} onLogout={handleLogout} role={usuario?.role} />
      </aside>

      {/* SIDEBAR — mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#1E293B] text-white flex flex-col z-10">
            <button className="absolute top-4 right-4 text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
            <SidebarContent currentPath={location.pathname} onLogout={handleLogout} onNavigate={() => setSidebarOpen(false)} role={usuario?.role} />
          </aside>
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── TOPBAR ── */}
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-base font-bold text-slate-900 leading-tight">{header.title}</p>
              <p className="text-xs text-blue-500 font-medium leading-tight">{header.subtitle}</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">

            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false); }}
                className="relative w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <Bell className="w-[18px] h-[18px]" />
                {notificacoes.filter((n) => !lidas.has(n.id)).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {notificacoes.filter((n) => !lidas.has(n.id)).length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeAll} />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-800">Notificações</p>
                    </div>
                    {notificacoes.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-slate-400">Nenhuma atividade recente.</p>
                    ) : (
                      notificacoes.map((n) => {
                        const isLida = lidas.has(n.id);
                        return (
                          <div
                            key={n.id}
                            className={`flex items-start gap-2 px-4 py-3 border-b border-slate-50 last:border-0 transition-colors ${
                              isLida ? "bg-slate-100" : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold ${isLida ? "text-slate-400" : "text-slate-700"}`}>
                                {n.profiles?.full_name ?? "Usuário"} {n.acao}
                                {n.documento && <span className="font-normal"> {n.documento}</span>}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(n.criado_em)}</p>
                            </div>
                            <button
                              onClick={() => toggleLida(n.id)}
                              title={isLida ? "Marcar como não visualizada" : "Marcar como visualizada"}
                              className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                isLida ? "text-blue-500 hover:bg-slate-200" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-slate-200" />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen((p) => !p); setNotifOpen(false); }}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-colors"
              >
                {/* Avatar */}
                {usuario?.avatar_url ? (
                  <img
                    src={usuario.avatar_url}
                    alt={usuario.full_name ?? ""}
                    className="w-9 h-9 rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs uppercase select-none">
                    {initials}
                  </div>
                )}

                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-sm font-bold text-slate-800">
                    {usuario?.full_name ?? "Administrador"}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    {ROLE_LABEL[usuario?.role ?? ""] ?? usuario?.role ?? "—"}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeAll} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden py-1">

                    <button
                      onClick={() => { closeAll(); navigate("/admin/perfil"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Meu Perfil
                    </button>

                    <button
                      onClick={() => { closeAll(); navigate("/admin/perfil"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <KeyRound className="w-4 h-4 text-slate-400" />
                      Alterar Senha
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* CONTEÚDO */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-full mx-auto">
            <Outlet context={{ usuario }} />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  currentPath, onLogout, onNavigate, role,
}: { currentPath: string; onLogout: () => void; onNavigate?: () => void; role?: string }) {
  return (
    <>
      <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
        <img src={logoSbs} alt="" className="w-[80%]" />
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto">
        {SECTIONS.map((section) => {
          const items = section.items.filter((item) => !item.adminOnly || role === "admin");
          if (items.length === 0) return null;
          return (
          <div key={section.title}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">
              {section.title}
            </p>
            <ul className="space-y-1">
              {items.map((item) => {
                const active = currentPath === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onNavigate}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                        active ? "bg-blue-600 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <span className={active ? "text-white" : "text-slate-400"}>{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair do painel
        </button>
      </div>
    </>
  );
}