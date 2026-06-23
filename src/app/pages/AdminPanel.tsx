import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, FileText, FolderTree, UploadCloud, Trash2,
  Users, ShieldAlert, BarChart3, LogOut, Menu, X, ChevronDown, Bell,
} from "lucide-react";
import logoSbs from '../../imgs/logosbs.png'

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
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
      { label: "Atas", path: "/admin/atas", icon: <FileText className="w-4 h-4" /> },
      { label: "Categorias", path: "/admin/categorias", icon: <FolderTree className="w-4 h-4" /> },
     // { label: "Uploads", path: "/admin/uploads", icon: <UploadCloud className="w-4 h-4" /> },
     // { label: "Lixeira", path: "/admin/lixeira", icon: <Trash2 className="w-4 h-4" /> },
    ],
  },
  // {
  //   title: "Credenciamento",
  //   items: [
  //     { label: "Usuários", path: "/admin/usuarios", icon: <Users className="w-4 h-4" /> },
  //     //{ label: "Permissões", path: "/admin/permissoes", icon: <ShieldAlert className="w-4 h-4" /> },
  //     { label: "Relatórios", path: "/admin/relatorios", icon: <BarChart3 className="w-4 h-4" /> },
  //   ],
  // },
];

const HEADER_INFO: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Dashboard", subtitle: "Visão geral do sistema" },
  "/admin/atas": { title: "Atas", subtitle: "Gerencie todas as atas cadastradas" },
  "/admin/categorias": { title: "Categorias", subtitle: "Organize as categorias das atas" },
  "/admin/uploads": { title: "Uploads", subtitle: "Gerencie os arquivos de apoio" },
  "/admin/lixeira": { title: "Lixeira", subtitle: "Itens removidos recentemente" },
  "/admin/usuarios": { title: "Usuários", subtitle: "Gestão de usuários do sistema" },
  "/admin/permissoes": { title: "Permissões", subtitle: "Matriz de permissões de acesso" },
  "/admin/relatorios": { title: "Relatórios", subtitle: "Relatórios estatísticos do sistema" },
};

export function AdminPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const header = HEADER_INFO[location.pathname] ?? { title: "Admin", subtitle: "" };

  const handleLogout = () => {
    // limpe seu token/estado de auth aqui, se houver
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900">
   
      {/* SIDEBAR — desktop */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-[#1E293B] text-white">
        <SidebarContent currentPath={location.pathname} onLogout={handleLogout} />
      </aside>

      {/* SIDEBAR — mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#1E293B] text-white flex flex-col z-10">
             
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent
              currentPath={location.pathname}
              onLogout={handleLogout}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-gray-500 font-medium">Painel {">"} <span className="text-gray-900 font-medium">{header.title}</span></p>
           
            </div>
          </div>

          <div className="flex items-center gap-4">
          
       {/* {     <button className="relative w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                3
              </span>
            </button> */}

            <div className="relative">
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs uppercase select-none">
                  AD
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-sm font-semibold text-slate-800">Administrador</p>
                  <p className="text-xs text-blue-600 font-medium">Gerente Geral</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair do painel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* CONTEÚDO — aqui entra a rota filha ativa */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  currentPath, onLogout, onNavigate,
}: { currentPath: string; onLogout: () => void; onNavigate?: () => void }) {
  return (
    <>
      <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-3">
       <img src={logoSbs} alt="" className="w-[80%]"/>

        </div>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = currentPath === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onNavigate}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
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
        ))}
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