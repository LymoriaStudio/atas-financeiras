import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

export default function Contato() {
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        telefone: "",
        mensagem: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log(formData);

        alert("Mensagem enviada com sucesso!");

        setFormData({
            nome: "",
            email: "",
            telefone: "",
            mensagem: "",
        });
    };

    return (
        <section className="min-h-screen bg-gray-50 py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-14 items-start">
                    <div>
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            Fale com nossa equipe
                        </h1>

                        <p className="text-gray-500 mb-16">
                            Entre em contato para tirar dúvidas sobre atas, documentos e
                            informações disponíveis no portal.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Mail size={20} />
                                <span>contato@atasfinanceiras.com.br</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <MapPin size={20} />
                                <span>Americana - SP, Brasil</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <Phone size={20} />
                                <span>+55 (19) 99999-9999</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <input
                                type="text"
                                name="nome"
                                placeholder="Nome Completo"
                                value={formData.nome}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-xl"
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="E-mail"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-xl"
                            />

                            <input
                                type="tel"
                                name="telefone"
                                placeholder="Telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-xl"
                            />

                            <textarea
                                name="mensagem"
                                rows={5}
                                placeholder="Digite sua mensagem"
                                value={formData.mensagem}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-xl"
                            />

                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl"
                            >
                                Enviar Mensagem
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}