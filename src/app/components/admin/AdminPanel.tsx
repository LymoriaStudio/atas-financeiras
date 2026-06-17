import { useState } from "react";
import {
  LayoutDashboard, FileText, FolderOpen, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import sbsLogo from "../../../imports/Ativo_1_4x.png";
import { AdminDashboard } from "./AdminDashboard";
import { AdminAtas } from "./AdminAtas";
import { AdminCategories } from "./AdminCategories";

type View = "dashboard" | "atas" | "categorias";

const navItems: { label: string; view: View; icon: React.ReactNode }[] = [
  { label: "Dashboard",  view: "dashboard",  icon: <LayoutDashboard size={18} /> },
  { label: "Atas",       view: "atas",        icon: <FileText size={18} /> },
  { label: "Categorias", view: "categorias",  icon: <FolderOpen size={18} /> },
];

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar — desktop */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 border-r border-gray-100"
        style={{ backgroundColor: "#ffffff" }}
      >
        <SidebarContent view={view} setView={setView} onLogout={onLogout} />
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 bg-white border-r border-gray-100 flex flex-col z-10">
            <SidebarContent
              view={view}
              setView={(v) => { setView(v); setSidebarOpen(false); }}
              onLogout={onLogout}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-800 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <span>Painel</span>
              <ChevronRight size={13} />
              <span className="text-gray-700 font-medium capitalize">{view}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold">
              AD
            </div>
            <span className="text-sm text-gray-600 hidden sm:block">Admin</span>
          </div>
        </header>

        {/* View */}
        <main className="flex-1 overflow-auto">
          {view === "dashboard"  && <AdminDashboard />}
          {view === "atas"       && <AdminAtas />}
          {view === "categorias" && <AdminCategories />}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  view, setView, onLogout,
}: { view: View; setView: (v: View) => void; onLogout: () => void }) {
  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100">
        <button onClick={onLogout} className="focus:outline-none" title="Voltar ao portal">
          <img src={sbsLogo} alt="SBS Participações" style={{ height: "36px", filter: "brightness(0)", cursor: "pointer" }} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest px-3 mb-3">Menu</p>
        {navItems.map((item) => {
          const active = view === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={
                active
                  ? { backgroundColor: "#111827", color: "#ffffff" }
                  : { color: "#6B7280", backgroundColor: "transparent" }
              }
            >
              <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut size={17} />
          Sair do painel
        </button>
      </div>
    </>
  );
}
