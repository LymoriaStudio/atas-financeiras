import { Mail, Phone, MapPin } from "lucide-react";
import SbsLogo from "../../imports/sbslogo.png";
import { Link } from "react-router";

interface FooterProps {
  onCategoryClick?: (category: string) => void;
}

export function Footer({ onCategoryClick }: FooterProps) {
  const quickLinks = [
    { label: "Início", href: "#home" },
    { label: "Sobre o Projeto", href: "sobre" },
    { label: "Consultar Atas", href: "consultar" },
    { label: "Contato", href: "/contato" },
  ];

  const categoryLinks = [
    { label: "Financeiro" },
    { label: "Atas" },
    { label: "Estatuto" },
    // { label: "Administrativo", href: "#administrativo" },
    // { label: "Licitações", href: "#licitacoes" },
    // { label: "Contratos", href: "#contratos" },
    // { label: "Reuniões", href: "#reunioes" },
    // { label: "Outros Documentos", href: "#outros" },
  ];

  return (
    <footer
      id="contato"
      className="bg-gray-900 text-white pt-16 pb-6"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Identidade */}
          <div>
            <div className="mb-5">
              <img
                src={SbsLogo}
                alt="Logo do Sistema de Atas"
                className="h-14 w-auto"
              />
            </div>

            <h3 className="text-lg font-semibold mb-3">
              Sistema de Atas Financeiras
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed">
              Portal de transparência para consulta de atas e documentos públicos de forma organizada e segura.
            </p>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              Navegação
            </h4>

       <ul className="space-y-3">
  {quickLinks.map((link) => (
    <li key={link.label}>
      {link.href.startsWith("/") ? (

        <a
          href={link.href}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          {link.label}
        </a>
      ) : (
        // Scroll suave para âncora na home
        <button
          onClick={() => {
            if (window.location.pathname !== "/") {
              window.location.href = `/#${link.href}`;
            } else {
              document.getElementById(link.href)?.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="text-gray-400 hover:text-white transition-colors text-sm bg-transparent border-none cursor-pointer p-0"
        >
          {link.label}
        </button>
      )}
    </li>
  ))}
</ul>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              Categorias
            </h4>

            <ul className="space-y-3">
              {categoryLinks.map((category) => (
                <li key={category.label}>
                  <button
                    onClick={() => onCategoryClick?.(category.label)}
                    className="text-gray-400 hover:text-white transition-colors text-sm bg-transparent border-none cursor-pointer p-0"
                  >
                    {category.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              Informações de Contato
            </h4>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail
                  size={16}
                  className="text-gray-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <a
                  href="mailto:contato@sistemaatas.com.br"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  contato@sistemaatas.com.br
                </a>
              </li>

              <li className="flex items-start gap-3">
                <Phone
                  size={16}
                  className="text-gray-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <a
                  href="tel:+5519999999999"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  (19) 99999-9999
                </a>
              </li>

              <li className="flex items-start gap-3">
                <MapPin
                  size={16}
                  className="text-gray-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-gray-400 text-sm">
                  Americana - SP, Brasil
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs text-center md:text-left">
              © 2026 Sistema de Atas Financeiras. Todos os direitos reservados.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="#privacidade"
                className="text-gray-500 hover:text-white text-xs transition-colors"
              >
                Política de Privacidade
              </a>

              <a
                href="#termos"
                className="text-gray-500 hover:text-white text-xs transition-colors"
              >
                Termos de Uso
              </a>

              <a
                href="#acessibilidade"
                className="text-gray-500 hover:text-white text-xs transition-colors"
              >
                Acessibilidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}