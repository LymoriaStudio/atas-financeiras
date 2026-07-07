import { CheckCircle2, XCircle, HelpCircle, Lock } from "lucide-react";

interface MatrixRow {
  recurso: string;
  descricao: string;
  admin: boolean;
  editor: boolean;
  viewer: boolean;
}

const MATRIX: MatrixRow[] = [
  { recurso: "Visualizar Atas", descricao: "Acesso para leitura de documentos e visualização dos arquivos.", admin: true, editor: true, viewer: true },
  { recurso: "Baixar Documentos", descricao: "Permissão para efetuar o download dos arquivos publicados.", admin: true, editor: true, viewer: true },
  { recurso: "Criar Novas Atas", descricao: "Capacidade de cadastrar novas atas no sistema.", admin: true, editor: true, viewer: false },
  { recurso: "Editar Atas Existentes", descricao: "Acesso para correção e atualização de atas já cadastradas.", admin: true, editor: true, viewer: false },
  { recurso: "Gerenciar Categorias", descricao: "Criar, editar e excluir categorias de classificação.", admin: true, editor: true, viewer: false },
  { recurso: "Mover Atas para a Lixeira", descricao: "Capacidade de excluir (temporariamente) atas do sistema.", admin: true, editor: false, viewer: false },
  { recurso: "Restaurar Itens da Lixeira", descricao: "Recuperação de atas excluídas de volta aos painéis ativos.", admin: true, editor: false, viewer: false },
  { recurso: "Gerenciar Usuários", descricao: "Ativação, desativação, criação e edição de contas de acesso.", admin: true, editor: false, viewer: false },
];

function Cell({ allowed }: { allowed: boolean }) {
  return (
    <div className="flex items-center justify-center">
      {allowed ? (
        <CheckCircle2 size={20} className="text-emerald-500" strokeWidth={2.5} />
      ) : (
        <XCircle size={20} className="text-red-300" />
      )}
    </div>
  );
}

export function AdminPermissoes() {
  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h1 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700 }}>Permissões</h1>
        <p className="text-gray-400 text-sm mt-1">Veja os direitos de acesso associados a cada perfil de usuário</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 pb-4 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h4 className="text-base font-bold text-gray-900">Matriz de Permissões</h4>
            <p className="text-xs text-gray-400 mt-1">Controle de acesso baseado no perfil cadastrado de cada usuário</p>
          </div>
          <span className="text-[10px] whitespace-nowrap font-bold uppercase border border-blue-200 bg-blue-50 text-blue-700 py-1 px-3.5 rounded-full flex items-center gap-1.5">
            <Lock size={14} /> Somente leitura
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase tracking-widest text-[10px] font-bold border-b border-gray-100">
                <th className="py-4 px-6">Recurso</th>
                <th className="py-4 px-6">Descrição</th>
                <th className="py-4 px-6 text-center">Admin</th>
                <th className="py-4 px-6 text-center">Editor</th>
                <th className="py-4 px-6 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {MATRIX.map((row) => (
                <tr key={row.recurso} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-gray-900">{row.recurso}</td>
                  <td className="py-4 px-6 text-gray-500 max-w-xs">{row.descricao}</td>
                  <td className="py-4 px-6"><Cell allowed={row.admin} /></td>
                  <td className="py-4 px-6"><Cell allowed={row.editor} /></td>
                  <td className="py-4 px-6"><Cell allowed={row.viewer} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-start gap-3.5 text-xs text-gray-500">
          <HelpCircle size={20} className="text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-gray-700 block">Como alterar o perfil de um usuário?</span>
            <p className="text-[11px] leading-relaxed max-w-3xl">
              As permissões acima seguem o perfil de cada conta. Para alterar o acesso de um colaborador específico,
              vá até a aba <strong>Usuários</strong> e mude o perfil dele — a mudança reflete automaticamente nesta matriz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
