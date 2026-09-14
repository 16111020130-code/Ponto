"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Key, Trash2 } from "lucide-react";
import { changeUserPassword, fetchUserRecords, deleteTimeRecord } from "@/app/admin-actions";

interface UserActionsProps {
  userId: string;
  userName: string;
}

export function UserActions({ userId, userName }: UserActionsProps) {
  const [newPassword, setNewPassword] = useState("");
  const [loadingPwd, setLoadingPwd] = useState(false);
  
  const [records, setRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return alert("A senha deve ter no mínimo 6 caracteres.");
    
    setLoadingPwd(true);
    try {
      await changeUserPassword(userId, newPassword);
      alert("Senha alterada com sucesso!");
      setNewPassword("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingPwd(false);
    }
  };

  const loadRecords = async () => {
    setLoadingRecords(true);
    try {
      const data = await fetchUserRecords(userId);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Tem certeza que deseja apagar esta batida de ponto? O funcionário precisará registrar novamente.")) return;
    
    try {
      await deleteTimeRecord(recordId);
      setRecords(prev => prev.filter(r => r.id !== recordId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      {/* Botão de Histórico */}
      <Dialog onOpenChange={(open) => { if (open) loadRecords(); }}>
        <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 h-8 px-2">
          <Clock className="w-4 h-4 mr-2" />
          Histórico
        </DialogTrigger>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Pontos: {userName}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {loadingRecords ? (
              <p className="text-zinc-500 text-center py-8">Carregando...</p>
            ) : records.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">Nenhum registro encontrado para este funcionário.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-2">Data / Hora</th>
                    <th className="px-4 py-2">Tipo</th>
                    <th className="px-4 py-2">Origem</th>
                    <th className="px-4 py-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                      <td className="px-4 py-3 text-zinc-200">
                        {new Date(r.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        {r.type === 'entrada' ? (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full text-xs">Entrada</span>
                        ) : (
                          <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full text-xs">Saída</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {r.source === 'web' ? 'Web' : 'Importação Excel'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleDeleteRecord(r.id)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-full transition-colors"
                          title="Excluir batida"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Botão de Alterar Senha */}
      <Dialog>
        <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 h-8 px-2">
          <Key className="w-4 h-4 mr-2" />
          Senha
        </DialogTrigger>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha: {userName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <Input 
                type="text" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-700" 
                placeholder="Mínimo 6 caracteres" 
                required 
              />
            </div>
            <Button type="submit" disabled={loadingPwd} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {loadingPwd ? "Salvando..." : "Atualizar Senha"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
