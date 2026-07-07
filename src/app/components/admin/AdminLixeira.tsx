import { useEffect, useState } from "react";
import { Trash2, RefreshCw, FolderLock, FileText, Loader2 } from "lucide-react";
import { getAtasLixeira, restoreAta, purgeAta, type Ata } from "../../../lib/api/atasService";
import { logAtividade } from "../../../lib/api/atividadesService";

function formatDate(iso?: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function AdminLixeira() {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { fetchLixeira(); }, []);

  async function fetchLixeira() {
    setLoading(true); setErrorMsg(null);
    const { data, error } = await getAtasLixeira();
    if (error) setErrorMsg("Não foi possível carregar a lixeira. Tente novamente.");
    else setAtas(data ?? []);
    setLoading(false);
  }

  async function handleRestore(ata: Ata) {
    setBusyId(ata.id);
    const { error } = await restoreAta(ata.id);
    if (!error) {
      setAtas((prev) => prev.filter((a) => a.id !== ata.id));
      logAtividade("restaurou uma ata da lixeira", ata.titulo);
    } else {
      setErrorMsg("Erro ao restaurar a ata.");
    }
    setBusyId(null);
  }

  async function handlePurge(ata: Ata) {
    if (!confirm(`Atenção: a exclusão de "${ata.titulo}" será definitiva e irreversível. Deseja continuar?`)) return;
    setBusyId(ata.id);
    const { error } = await purgeAta(ata.id);
    if (!error) {
      setAtas((prev) => prev.filter((a) => a.id !== ata.id));
      logAtividade("excluiu permanentemente do lixo", ata.titulo);
    } else {
      setErrorMsg("Erro ao excluir definitivamente.");
    }
    setBusyId(null);
  }

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h1 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700 }}>Lixeira</h1>
        <p className="text-gray-400 text-sm mt-1">Restaure ou elimine definitivamente atas excluídas</p>
      </div>

      {errorMsg && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{errorMsg}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 pb-4 border-b border-gray-50">
          <h4 className="text-base font-bold text-gray-900">Atas Excluídas</h4>
          <p className="text-xs text-gray-400 mt-1">Documentos em descarte provisório com suporte à restauração imediata</p>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando lixeira...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase tracking-widest text-[10px] font-bold border-b border-gray-100">
                  <th className="py-4 px-6">Ata</th>
                  <th className="py-4 px-6">Excluída em</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {atas.map((ata) => (
                  <tr key={ata.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-700 shrink-0">
                          <FileText size={12} /> Ata
                        </span>
                        <span className="font-semibold text-gray-800">{ata.titulo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-400 whitespace-nowrap">{formatDate(ata.deleted_at)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRestore(ata)}
                          disabled={busyId === ata.id}
                          className="flex items-center gap-1 px-3 py-1.5 border border-blue-100 bg-blue-50/50 text-blue-700 hover:bg-blue-100 rounded-md text-[11px] font-bold transition-all disabled:opacity-50"
                        >
                          <RefreshCw size={12} /> Restaurar
                        </button>
                        <button
                          onClick={() => handlePurge(ata)}
                          disabled={busyId === ata.id}
                          className="flex items-center gap-1 px-3 py-1.5 border border-red-100 bg-red-50/50 text-red-700 hover:bg-red-100 rounded-md text-[11px] font-bold transition-all disabled:opacity-50"
                        >
                          <Trash2 size={12} /> Destruir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {atas.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-20 text-gray-400">
                      <FolderLock size={44} className="opacity-30 mx-auto mb-3.5" />
                      <p className="text-sm font-semibold text-gray-700">Lixeira sem registros pendentes</p>
                      <p className="text-xs text-gray-400 mt-1">Todas as atas estão ativas no sistema</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
