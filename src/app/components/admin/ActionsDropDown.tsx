import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import {
  BarChart2, FileText, Gavel, Users, Building2, Calendar, Briefcase,
  Landmark, ClipboardList, Scale, Shield, Archive, BookOpen, DollarSign,
  TrendingUp, Star, Pencil, Trash2, Plus, X, Check, Loader2, Eye,
  MoreHorizontal,
} from "lucide-react";
import {
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  type Categoria,
} from "../../../lib/api/categoriasService";
import { getAtas, type Ata } from "../../../lib/api/atasService";

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

type FormState = { name: string; description: string; icon: string; color: string };
const emptyForm: FormState = { name: "", description: "", icon: "FileText", color: "#111827" };

function toArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.length) return [raw];
  return [];
}

// ─── Portal container global (único, fora do React tree) ──────────────────────
// Criado uma vez fora de qualquer componente — nunca é removido,
// então o React nunca perde a referência ao tentar fazer removeChild.
const portalRoot = (() => {
  const el = document.createElement("div");
  el.id = "dropdown-portal";
  document.body.appendChild(el);
  return el;
})();

// ─── ActionsDropdown ──────────────────────────────────────────────────────────
function ActionsDropdown({ cat, onView, onEdit, onDelete }: {
  cat: Categoria;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  // Fecha ao desmontar (ex: categoria excluída enquanto menu está aberto)
  useEffect(() => () => setOpen(false), []);

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        aria-label="Ações"
        style={{
          width: 32, height: 32, borderRadius: 8, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "none", border: "none", cursor: "pointer", color: "#9CA3AF",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#374151"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#9CA3AF"; }}
      >
        <MoreHorizontal size={16} />
      </button>

      {open && ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: coords.top,
            right: coords.right,
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            minWidth: 148,
            overflow: "hidden",
          }}
        >
          {[
            { label: "Visualizar", icon: <Eye size={14} style={{ color: "#3B82F6" }} />, color: "#374151", hover: "#F9FAFB", action: onView },
            { label: "Editar",     icon: <Pencil size={14} style={{ color: "#6B7280" }} />, color: "#374151", hover: "#F9FAFB", action: onEdit },
          ].map(({ label, icon, color, hover, action }) => (
            <button
              key={label}
              onClick={() => { action(); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", fontSize: 14, color, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              {icon}{label}
            </button>
          ))}
          <div style={{ height: 1, background: "#F3F4F6", margin: "2px 0" }} />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", fontSize: 14, color: "#EF4444", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <Trash2 size={14} />Excluir
          </button>
        </div>,
        portalRoot  // ← container estável, nunca removido
      )}
    </>
  );
}