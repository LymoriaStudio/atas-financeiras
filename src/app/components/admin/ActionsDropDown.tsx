import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";

function ActionsDropdown({
  cat,
  onView,
  onEdit,
  onDelete,
}: {
  cat: Categoria;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calcula posição ao abrir
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

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Fecha ao rolar
  useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  const menu = open
    ? ReactDOM.createPortal(
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
          <button
            onClick={() => { onView(); setOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "10px 16px",
              fontSize: 14, color: "#374151",
              background: "none", border: "none", cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <Eye size={14} style={{ color: "#3B82F6" }} />
            Visualizar
          </button>
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "10px 16px",
              fontSize: 14, color: "#374151",
              background: "none", border: "none", cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <Pencil size={14} style={{ color: "#6B7280" }} />
            Editar
          </button>
          <div style={{ height: 1, background: "#F3F4F6", margin: "2px 0" }} />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "10px 16px",
              fontSize: 14, color: "#EF4444",
              background: "none", border: "none", cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <Trash2 size={14} />
            Excluir
          </button>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        style={{
          width: 32, height: 32, borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "none", border: "none", cursor: "pointer",
          color: "#9CA3AF",
        }}
        onMouseEnter={(e) => { (e.currentTarget.style.background = "#F3F4F6"); (e.currentTarget.style.color = "#374151"); }}
        onMouseLeave={(e) => { (e.currentTarget.style.background = "none"); (e.currentTarget.style.color = "#9CA3AF"); }}
        aria-label="Ações"
      >
        <MoreHorizontal size={16} />
      </button>
      {menu}
    </>
  );
}