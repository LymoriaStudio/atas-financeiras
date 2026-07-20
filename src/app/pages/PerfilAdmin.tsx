import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import { uploadProfilePic } from "../../lib/api/storageService";
import {
  getUsuarioAtual,
  updateUsuario,
  type Usuario,
} from "../../lib/api/usuarioService";
import {
  User, Mail, Briefcase, Building, Shield, Calendar, Clock,
  Key, Camera, X, Check, ShieldCheck, Lock, Eye, EyeOff, AlertCircle, Pencil,
} from "lucide-react";
import { useCachedResource } from "../../lib/useCachedResource";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function PerfilPage() {
  const navigate = useNavigate();

  const { data: usuario, loading, setData: setUsuario } = useCachedResource<Usuario>("usuario-perfil", getUsuarioAtual);
  const [nome, setNome]               = useState("");
  const [avatarUrl, setAvatarUrl]     = useState("");
  const [isSaved, setIsSaved]         = useState(false);
  const [saveError, setSaveError]     = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  // Campos institucionais (edição habilitada apenas via lápis)
  const [editingDetails, setEditingDetails] = useState(false);
  const [email, setEmail]           = useState("");
  const [jobTitle, setJobTitle]     = useState("");
  const [department, setDepartment] = useState("");

  // Modal alterar senha
  const [modalOpen,          setModalOpen]          = useState(false);
  const [senhaAtual,         setSenhaAtual]         = useState("");
  const [novaSenha,          setNovaSenha]          = useState("");
  const [confirmarSenha,     setConfirmarSenha]     = useState("");
  const [showAtual,          setShowAtual]          = useState(false);
  const [showNova,           setShowNova]           = useState(false);
  const [showConfirmar,      setShowConfirmar]      = useState(false);
  const [passwordError,      setPasswordError]      = useState("");
  const [senhaAtualError,    setSenhaAtualError]    = useState("");
  const [passwordSuccess,    setPasswordSuccess]    = useState(false);
  const [passwordLoading,    setPasswordLoading]    = useState(false);

  // ── Redireciona se não houver sessão, e inicializa o formulário uma vez ──
  useEffect(() => {
    if (!loading && !usuario) { navigate("/login"); return; }
    if (usuario && !hasInitialized.current) {
      hasInitialized.current = true;
      setNome(usuario.full_name ?? "");
      setAvatarUrl(usuario.avatar_url ?? "");
      setEmail(usuario.email ?? "");
      setJobTitle(usuario.job_title ?? "");
      setDepartment(usuario.department ?? "");
    }
  }, [usuario, loading, navigate]);

  // ── Salvar dados cadastrais ──────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario || !nome.trim()) return;
    setSaveError("");

    const { data, error } = await updateUsuario(usuario.id, {
      full_name: nome,
      email,
      job_title: jobTitle,
      department,
    });
    if (error) { setSaveError("Erro ao salvar. Tente novamente."); return; }
    if (data) setUsuario(data);

    setEditingDetails(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }

  function handleCancelDetails() {
    if (!usuario) return;
    setEmail(usuario.email ?? "");
    setJobTitle(usuario.job_title ?? "");
    setDepartment(usuario.department ?? "");
    setSaveError("");
    setEditingDetails(false);
  }

  // ── Upload de avatar ──────────────────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;
    e.target.value = "";

    const { url, error } = await uploadProfilePic(file, usuario.id);
    if (error || !url) return;

    setAvatarUrl(url);
    const { data } = await updateUsuario(usuario.id, { avatar_url: url });
    if (data) setUsuario(data);
  }

  // ── Alterar senha ─────────────────────────────────────────────────────────
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setSenhaAtualError("");
    setPasswordSuccess(false);

    if (!senhaAtual) {
      setSenhaAtualError("Informe sua senha atual.");
      return;
    }
    if (novaSenha.length < 8) {
      setPasswordError("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setPasswordError("As senhas não conferem.");
      return;
    }
    if (!usuario?.email) {
      setPasswordError("Não foi possível validar sua senha atual.");
      return;
    }

    setPasswordLoading(true);

    // Não existe "buscar" a senha atual (ela nunca fica em texto puro) —
    // a forma correta de validar é tentar autenticar com ela.
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: usuario.email,
      password: senhaAtual,
    });

    if (authError) {
      setPasswordLoading(false);
      setSenhaAtualError("Senha atual incorreta.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setPasswordLoading(false);

    if (error) { setPasswordError("Erro ao alterar senha. Tente novamente."); return; }

    setPasswordSuccess(true);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setTimeout(() => { setModalOpen(false); setPasswordSuccess(false); }, 2000);
  }

  function closeModal() {
    setModalOpen(false);
    setPasswordError("");
    setSenhaAtualError("");
    setPasswordSuccess(false);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
  }

  // ── Formatadores ──────────────────────────────────────────────────────────
  function fmtDate(iso?: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR");
  }
  function fmtDateTime(iso?: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("pt-BR");
  }

  const roleLabel: Record<string, string> = {
    admin:  "Administrador",
    editor: "Editor",
    viewer: "Visualizador",
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return <LoadingSpinner label="Carregando perfil…" className="h-64" />;
  }

  if (!usuario) return null;

  const initials = (usuario.full_name ?? "AD")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8 text-left">

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Meu Perfil Corporativo</h2>
        <p className="text-xs text-slate-500 mt-1">
          Visualize seus dados de cadastro, altere suas preferências de exibição e credenciais de segurança
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Coluna esquerda ── */}
        <div className="lg:col-span-1 space-y-6">

          {/* Card avatar + ações */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col items-center text-center">

            {/* Avatar */}
            <div className="relative group mt-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={usuario.full_name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-slate-50 shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-slate-200 border-4 border-slate-50 shadow-md flex items-center justify-center text-slate-600 font-bold text-3xl">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-white flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer"
                title="Alterar foto de perfil"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Nome / cargo / role */}
            <div className="mt-4 space-y-1 w-full">
              <h3 className="font-bold text-slate-900 text-base">{usuario.full_name ?? "—"}</h3>
              <p className="text-xs text-slate-500">{usuario.job_title ?? "—"}</p>
              <div className="pt-2 flex justify-center">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 py-0.5 px-3 rounded-full uppercase tracking-wider">
                  {roleLabel[usuario.role] ?? usuario.role}
                </span>
              </div>
            </div>

            {/* Alterar senha */}
            <div className="w-full pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-slate-500" />
                ALTERAR SENHA DE ACESSO
              </button>
            </div>
          </div>

          {/* Metadados */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Dados de Cadastro
            </h4>
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Data do Cadastro</span>
                  <span className="text-xs text-slate-700 font-medium">{fmtDate(usuario.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Última Atualização</span>
                  <span className="text-xs text-slate-700 font-medium">{fmtDateTime(usuario.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Coluna direita ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Detalhes Cadastrais */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h3 className="font-bold text-slate-900 text-sm">
                Detalhes Cadastrais
              </h3>
              <button
                type="button"
                onClick={() => setEditingDetails((v) => !v)}
                title={editingDetails ? "Bloquear campos institucionais" : "Editar campos institucionais"}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  editingDetails
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-transparent"
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Nome — editável */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-500 font-semibold text-slate-800"
                  />
                </div>

                {/* E-mail */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Endereço de E-mail {!editingDetails && "(Bloqueado)"}
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      disabled={!editingDetails}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full text-xs pl-9 pr-3 py-2.5 border rounded-lg font-medium ${
                        editingDetails
                          ? "bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-500"
                          : "bg-slate-200 border-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>

                {/* Cargo */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cargo Corporativo {!editingDetails && "(Bloqueado)"}
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      disabled={!editingDetails}
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className={`w-full text-xs pl-9 pr-3 py-2.5 border rounded-lg font-medium ${
                        editingDetails
                          ? "bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-500"
                          : "bg-slate-200 border-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>

                {/* Departamento */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Departamento de Alocação {!editingDetails && "(Bloqueado)"}
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      disabled={!editingDetails}
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className={`w-full text-xs pl-9 pr-3 py-2.5 border rounded-lg font-medium ${
                        editingDetails
                          ? "bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-500"
                          : "bg-slate-200 border-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>

              </div>

              {saveError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {saveError}
                </p>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium">
                  * Clique no ícone de lápis para habilitar a edição dos campos institucionais.
                </span>
                <div className="flex items-center gap-2">
                  {editingDetails && (
                    <button
                      type="button"
                      onClick={handleCancelDetails}
                      className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      CANCELAR
                    </button>
                  )}
                  {editingDetails && (
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSaved && <Check className="w-4 h-4" />}
                      {isSaved ? "DADOS SALVOS!" : "SALVAR ALTERAÇÕES"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Escopo de Permissões */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
              <Shield className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Nível de Permissões</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Seu perfil de acesso é mapeado como{" "}
              <strong className="text-slate-800">{roleLabel[usuario.role] ?? usuario.role}</strong>.
              Abaixo constam as principais diretrizes de governança aplicadas ao seu nível de privilégio:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[
                { title: "Lavratura Total",          desc: "Criação, edição e exclusão de atas oficiais e rascunhos." },
                { title: "Parâmetros de Sistema",    desc: "Gerenciamento de categorias, relatórios e permissões." },
                { title: "Administração de Quadros", desc: "Cadastramento direto e ativação/desativação de utilizadores." },
                { title: "Documentos & Lixeira",     desc: "Exclusão irreversível ou restauração de entidades arquivadas." },
              ].map((p) => (
                <div key={p.title} className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-800">{p.title}</span>
                    <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">{p.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Modal Alterar Senha ─────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-100 shadow-2xl relative z-10">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-sm">Alterar Senha de Acesso</h4>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-xs flex items-start gap-2 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Senha redefinida com sucesso! Fechando…</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">

              {/* Senha Atual */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={showAtual ? "text" : "password"}
                    required
                    placeholder="Digite sua senha atual"
                    value={senhaAtual}
                    onChange={(e) => { setSenhaAtual(e.target.value); if (senhaAtualError) setSenhaAtualError(""); }}
                    className={`w-full text-xs pl-3.5 pr-10 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 font-semibold ${
                      senhaAtualError ? "border-red-300" : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  <button type="button" onClick={() => setShowAtual(!showAtual)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {senhaAtualError && (
                  <p className="text-red-500 text-xs flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {senhaAtualError}
                  </p>
                )}
              </div>

              {/* Nova Senha */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showNova ? "text" : "password"}
                    required
                    placeholder="Mínimo de 8 caracteres"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-500 font-semibold"
                  />
                  <button type="button" onClick={() => setShowNova(!showNova)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showNova ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmar ? "text" : "password"}
                    required
                    placeholder="Repita a nova senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-500 font-semibold"
                  />
                  <button type="button" onClick={() => setShowConfirmar(!showConfirmar)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md transition-all uppercase tracking-wider cursor-pointer disabled:opacity-60"
                >
                  {passwordLoading ? "Salvando…" : "Confirmar Redefinição"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}