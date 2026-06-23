import { LogIn, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import vegasLogo from "../../imports/Ativo_1_4x.png";
import { Link } from "react-router";

interface NavbarProps {
  onAdminClick?: () => void;
}

export function Navbar({ onAdminClick, isContato }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Home",           anchor: "home" },
    { label: "Sobre",          anchor: "sobre" },
    { label: "Consultar Atas", anchor: "consultar" },
    { label: "Transparência",  anchor: "transparencia" },
  ];

  const scrollTo = (anchor: string) => {
    if (anchor === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled || isContato ? "rgba(255,255,255,0.97)" : "transparent",
        boxShadow: scrolled || isContato? "0 1px 16px rgba(0,0,0,0.08)" : "none",
        backdropFilter: scrolled || isContato? "blur(12px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo Vegas */}
        <div className="flex items-center">
          <Link to="/">
          <img
            src={vegasLogo}
            alt="Vegas"
            className="transition-all duration-300"
            style={{
              height: "44px",
              width: "auto",
              filter: scrolled || isContato
                ? "brightness(0) saturate(0)"
                : "brightness(1) drop-shadow(0 1px 6px rgba(0,0,0,0.6))",
            }}
          />
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.anchor)}
              className="text-sm transition-colors duration-300 hover:opacity-70 bg-transparent border-none cursor-pointer"
              style={{ color: scrolled || isContato ? "#374151" : "rgba(255,255,255,0.9)" }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:flex">
          <button
            onClick={onAdminClick}
            className="flex cursor-pointer items-center gap-2 text-sm px-5 py-2.5 rounded-lg transition-all duration-300"
            style={
              scrolled || isContato
                ? { backgroundColor: "#111827", color: "#ffffff" }
                : {
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.4)",
                  }
            }
          >
            <LogIn size={15} />
            Entrar no painel
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden transition-colors duration-300"
          style={{ color: scrolled ? "#111827" : "#ffffff" }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-6 pb-4 border-t"
          style={{ backgroundColor: "rgba(255,255,255,0.97)", borderColor: "#f3f4f6" }}
        >
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.anchor)}
              className="block w-full text-left text-gray-600 hover:text-gray-900 text-sm py-3 border-b border-gray-100 bg-transparent cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <button
            className="mt-4 w-full cursor-pointer flex items-center justify-center gap-2 text-white text-sm px-5 py-2.5 rounded-lg"
            style={{ backgroundColor: "#111827" }}
               onClick={onAdminClick}
          >
            <LogIn size={15} />
            Entrar no painel
          </button>
        </div>
      )}
    </nav>
  );
}
