import { useState } from "react";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

interface Props {
  onAdminClick?: () => void;
  onBack?: () => void;
}

export function Contato({ onAdminClick, onBack }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);

  function handleSubmit() {
    if (!nome || !email || !mensagem) return;
    // Aqui você integra com sua API de envio
    setEnviado(true);
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar onAdminClick={onAdminClick ?? (() => { })} isContato />

      <main className="flex-1 bg-gray-50 py-16 mt-15">
        <div className="max-w-5xl mx-auto px-6">

          {/* Page title — padrão igual ao SearchAndAtas */}
          <div className="text-center mb-12">
            <h2
              className="mb-2"
              style={{ color: "#111827", fontSize: "1.75rem", fontWeight: 700 }}
            >
              Contato
            </h2>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-10 items-start">

            {/* Left — info */}
            <div className="lg:w-2/5 flex flex-col gap-6">
              <div>
                <h3
                  className="text-2xl font-bold leading-snug mb-3"
                  style={{ color: "#111827" }}
                >
                  Fale com a nossa<br />equipe
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Tem dúvidas sobre as publicações, precisa de suporte
                  com os documentos ou quer enviar uma sugestão? Entre
                  em contato conosco.
                </p>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#111827" }}
                  >
                    <Mail size={14} className="text-white" />
                  </div>
                  <span className="text-gray-600 text-sm">contato@sistemaatas.com.br</span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#111827" }}
                  >
                    <MapPin size={14} className="text-white" />
                  </div>
                  <span className="text-gray-600 text-sm">Americana - SP, Brasil</span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#111827" }}
                  >
                    <Phone size={14} className="text-white" />
                  </div>
                  <span className="text-gray-600 text-sm">(19) 99999-9999</span>
                </div>
              </div>
            </div>

            {/* Right — form card */}
            <div className="lg:w-3/5 w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              {enviado ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: "#111827" }}
                  >
                    <Mail size={20} className="text-white" />
                  </div>
                  <p className="text-gray-800 font-semibold text-base">Mensagem enviada!</p>
                  <p className="text-gray-400 text-sm">Entraremos em contato em breve.</p>
                  <button
                    onClick={() => { setNome(""); setEmail(""); setMensagem(""); setEnviado(false); }}
                    className="mt-4 text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-5">

                  {/* Nome */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nome</label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  {/* E-mail */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">E-mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Digite seu endereço de E-mail"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Mensagem</label>
                    <textarea
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      placeholder="Como podemos ajudar?"
                      rows={5}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    style={{ backgroundColor: "#111827" }}
                  >
                    Enviar mensagem
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}