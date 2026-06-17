import { Mail, Phone } from "lucide-react";
import vegasLogo from "../../imports/Ativo_1_4x.png";

export function Footer() {
  const quickLinks = ["Home", "Sobre o projeto", "Consultar Atas", "Contato"];
  const categoryLinks = ["Financeiro", "Administrativo", "Licitações", "Contratos", "Reuniões", "Outros"];

  return (
    <footer id="contato" style={{ backgroundColor: "#111827" }} className="text-white pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo */}
          <div>
            <div className="mb-5">
              <img src={vegasLogo} alt="Vegas" style={{ height: "52px", width: "auto" }} />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Portal de transparência para consulta de atas e documentos públicos de forma organizada e segura.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Links Rápidos</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Categorias</h4>
            <ul className="space-y-2.5">
              {categoryLinks.map((cat) => (
                <li key={cat}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-gray-400 shrink-0" />
                <a href="mailto:contato@financeiro.com.br" className="text-gray-400 hover:text-white text-sm transition-colors">
                  contato@financeiro.com.br
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-gray-400 shrink-0" />
                <a href="tel:9999999999" className="text-gray-400 hover:text-white text-sm transition-colors">
                  99999 9999
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © 2026 LOGO ATA. Todos os direitos reservados
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-white text-xs transition-colors">Política de privacidade</a>
            <a href="#" className="text-gray-500 hover:text-white text-xs transition-colors">Termos de uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
