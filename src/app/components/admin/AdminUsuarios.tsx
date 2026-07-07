import { useEffect, useState } from "react";
import {
  Plus, Search, Eye, Pencil, Trash2, X, Check, Loader2,
  UserCircle2, ShieldCheck, ShieldAlert, User,
} from "lucide-react";
import {
  getUsuarios, createUsuario, updateUsuario, deleteUsuario, type Usuario,
} from "../../../lib/api/usuarioService";
import { logAtividade } from "../../../lib/api/atividadesService";

const ROLES = ["admin", "editor", "viewer"];

const ROLE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  admin:  { bg: "#FEF2F2", color: "#DC2626", label: "Admin" },
  editor: { bg: "#EFF6FF", color: "#1D4ED8", label: "Editor" },
  viewer: { bg: "#F0FDF4", color: "#15803D", label: "Visualizador" },
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  admin:  <ShieldAlert size={13} />,
  editor: <ShieldCheck size={13} />,
  viewer: <User size={13} />,
};

type ModalMode = "add" | "edit" | "view" | null;

type FormState = {
  full_name: string;
  email: string;
  role: string;
  job_title: string;
  department: string;
  is_active: boolean;
  avatar_url: string;
};

const emptyForm: FormState = {
  full_name: "",
  email: "",
  role: "viewer",
  job_title: "",
  department: "",
  is_active: true,
  avatar_url: "",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const [query, setQuery] = useState("");
  const [filterRole, setFilterRole] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");

  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<Usuario | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    setErrorMsg(null);
    const { data, error } = await getUsuarios();
    if (error) setErrorMsg("Não foi possível carregar os usuários. Tente novamente.");
    else setUsuarios(data ?? []);
    setLoading(false);
  }

  const filtered = usuarios.filter((u) => {
    const q = query.toLowerCase();
    const matchQ = q === "" ||
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q);
    const matchRole = filterRole === "Todos" || u.role === filterRole;
    const matchStatus = filterStatus === "Todos" ||
      (filterStatus === "Ativo" ? u.is_active : !u.is_active);
    return matchQ && matchRole && matchStatus;
  });

  const openAdd = () => { setForm(emptyForm); setModal("add"); setEditingId(null); };
  const openEdit = (u: Usuario) => {
    setForm({
      full_name: u.full_name ?? "",
      email: u.email ?? "",
      role: u.role,
      job_title: u.job_title ?? "",
      department: u.department ?? "",
      is_active: u.is_active,
      avatar_url: u.avatar_url ?? "",
    });
    setEditingId(u.id);
    setModal("edit");
  };
  const openView = (u: Usuario) => { setViewingUser(u); setModal("view"); };
  const closeModal = () => {
    setModal(null);
    setForm(emptyForm);
    setEditingId(null);
    setViewingUser(null);
  };

  const saveForm = async () => {
    if (!form.full_name || !form.email) return;
    setSubmitting(true);
    setErrorMsg(null);

    if (modal === "add") {
      const { data, error } = await createUsuario(form);
      if (!error && data) {
        setUsuarios((prev) => [data, ...prev]);
        logAtividade("cadastrou um novo usuário", form.full_name);
      }
      else { setErrorMsg("Erro ao criar usuário. Tente novamente."); setSubmitting(false); return; }
    } else if (modal === "edit" && editingId) {
      const { data, error } = await updateUsuario(editingId, form);
      if (!error && data) {
        setUsuarios((prev) => prev.map((u) => (u.id === editingId ? data : u)));
        logAtividade("editou dados do usuário", data.full_name);
      }
      else { setErrorMsg("Erro ao salvar alterações. Tente novamente."); setSubmitting(false); return; }
    }

    setSubmitting(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); closeModal(); }, 700);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const deletingUser = usuarios.find((u) => u.id === deletingId);
    const { error } = await deleteUsuario(deletingId);
    if (!error) {
      setUsuarios((prev) => prev.filter((u) => u.id !== deletingId));
      logAtividade("excluiu um usuário", deletingUser?.full_name);
    } else {
      setErrorMsg("Erro ao excluir usuário.");
    }
    setDeletingId(null);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700 }}>Usuários</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie os usuários com acesso ao painel administrativo</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 text-white text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto shrink-0"
          style={{ backgroundColor: "#111827" }}
        >
          <Plus size={16} />
          Novo Usuário
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["Todos", "admin", "editor", "viewer"].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className="px-4 py-1.5 rounded-full text-xs font-medium border transition-all"
            style={
              filterRole === r
                ? { backgroundColor: "#111827", color: "#fff", borderColor: "#111827" }
                : { backgroundColor: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
            }
          >
            {r === "Todos" ? "Todos os perfis" : ROLE_STYLE[r]?.label ?? r}
          </button>
        ))}
        <div className="w-px bg-gray-200 mx-1" />
        {["Todos", "Ativo", "Inativo"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="px-4 py-1.5 rounded-full text-xs font-medium border transition-all"
            style={
              filterStatus === s
                ? { backgroundColor: "#111827", color: "#fff", borderColor: "#111827" }
                : { backgroundColor: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="py-16 flex items-center justify-center gap-2 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 size={16} className="animate-spin" />
          Carregando usuários...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100 shadow-sm">
          Nenhum usuário encontrado.
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-3.5 border-b border-gray-100 bg-gray-50">
              <div className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuário</div>
              <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Perfil</div>
              <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cargo / Departamento</div>
              <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</div>
              <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Ações</div>
            </div>

            {filtered.map((u) => {
              const rs = ROLE_STYLE[u.role] ?? { bg: "#F3F4F6", color: "#374151", label: u.role };
              return (
                <div key={u.id} className="grid grid-cols-12 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors items-center">
                  {/* Usuário */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: u.avatar_url ? "transparent" : rs.color }}
                    >
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                        : getInitials(u.full_name)
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-800 text-sm font-medium truncate">{u.full_name || "—"}</p>
                      <p className="text-gray-400 text-xs truncate">{u.email || "—"}</p>
                    </div>
                  </div>

                  {/* Perfil */}
                  <div className="col-span-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: rs.bg, color: rs.color }}
                    >
                      {ROLE_ICON[u.role]}
                      {rs.label}
                    </span>
                  </div>

                  {/* Cargo / Dept */}
                  <div className="col-span-3 min-w-0">
                    <p className="text-gray-700 text-sm truncate">{u.job_title || "—"}</p>
                    <p className="text-gray-400 text-xs truncate">{u.department || "—"}</p>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                      {u.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <button onClick={() => openView(u)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Visualizar">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => openEdit(u)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDeletingId(u.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Excluir">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((u) => {
              const rs = ROLE_STYLE[u.role] ?? { bg: "#F3F4F6", color: "#374151", label: u.role };
              return (
                <div key={u.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ backgroundColor: rs.color }}
                      >
                        {u.avatar_url
                          ? <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          : getInitials(u.full_name)
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-800 text-sm font-semibold truncate">{u.full_name || "—"}</p>
                        <p className="text-gray-400 text-xs truncate">{u.email || "—"}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                      {u.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: rs.bg, color: rs.color }}
                    >
                      {ROLE_ICON[u.role]}
                      {rs.label}
                    </span>
                    {u.department && (
                      <span className="text-gray-400 text-xs">{u.department}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-50">
                    <button onClick={() => openView(u)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => openEdit(u)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeletingId(u.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="text-gray-400 text-xs mt-3 text-right">
        {filtered.length} usuário{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* View Modal */}
      {modal === "view" && viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ color: "#111827", fontWeight: 700 }}>Detalhes do Usuário</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={18} /></button>
            </div>

            <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
                style={{ backgroundColor: ROLE_STYLE[viewingUser.role]?.color ?? "#111827" }}
              >
                {viewingUser.avatar_url
                  ? <img src={viewingUser.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                  : getInitials(viewingUser.full_name)
                }
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{viewingUser.full_name || "—"}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{viewingUser.email || "—"}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {[
                { label: "Perfil", value: ROLE_STYLE[viewingUser.role]?.label ?? viewingUser.role },
                { label: "Cargo", value: viewingUser.job_title || "—" },
                { label: "Departamento", value: viewingUser.department || "—" },
                { label: "Status", value: viewingUser.is_active ? "Ativo" : "Inativo" },
                { label: "Criado em", value: formatDate(viewingUser.created_at) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Fechar</button>
              <button
                onClick={() => { closeModal(); openEdit(viewingUser); }}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
                style={{ backgroundColor: "#111827" }}
              >
                <Pencil size={14} /> Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 shrink-0">
              <h2 style={{ color: "#111827", fontWeight: 700 }}>
                {modal === "add" ? "Novo Usuário" : "Editar Usuário"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome completo</label>
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="Ex: Maria Silva"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="maria@empresa.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cargo</label>
                  <input
                    value={form.job_title}
                    onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                    placeholder="Ex: Analista Financeiro"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Departamento</label>
                  <input
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="Ex: Financeiro"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Perfil de acesso</label>
                <div className="flex gap-3">
                  {ROLES.map((r) => {
                    const rs = ROLE_STYLE[r];
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm({ ...form, role: r })}
                        className="flex-1 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        style={
                          form.role === r
                            ? { backgroundColor: rs.color, color: "#fff", borderColor: rs.color }
                            : { backgroundColor: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
                        }
                      >
                        {ROLE_ICON[r]}
                        {rs.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <div className="flex gap-3">
                  {[{ label: "Ativo", value: true }, { label: "Inativo", value: false }].map(({ label, value }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setForm({ ...form, is_active: value })}
                      className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all"
                      style={
                        form.is_active === value
                          ? { backgroundColor: "#111827", color: "#fff", borderColor: "#111827" }
                          : { backgroundColor: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL do avatar <span className="font-normal text-gray-400">(opcional)</span></label>
                <input
                  value={form.avatar_url}
                  onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              {/* Preview */}
              {(form.full_name || form.email) && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: ROLE_STYLE[form.role]?.color ?? "#111827" }}
                  >
                    {form.avatar_url
                      ? <img src={form.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      : getInitials(form.full_name)
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{form.full_name || "Nome do usuário"}</p>
                    <p className="text-xs text-gray-400 truncate">{form.email || "email@exemplo.com"}</p>
                  </div>
                  <span
                    className="ml-auto shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: ROLE_STYLE[form.role]?.bg, color: ROLE_STYLE[form.role]?.color }}
                  >
                    {ROLE_ICON[form.role]}
                    {ROLE_STYLE[form.role]?.label}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-100 shrink-0">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={saveForm}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{ backgroundColor: saved ? "#15803D" : "#111827" }}
              >
                {submitting ? <Loader2 size={15} className="animate-spin" />
                  : saved ? <><Check size={15} /> Salvo!</>
                  : modal === "add" ? "Adicionar" : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 style={{ color: "#111827", fontWeight: 700, fontSize: "1rem" }} className="mb-2">Excluir usuário?</h3>
            <p className="text-gray-400 text-sm mb-6">Esta ação não pode ser desfeita. O usuário perderá acesso ao painel.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}