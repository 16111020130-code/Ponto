import { fetchUsers, fetchShifts, toggleUserStatus } from "@/app/admin-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserForm } from "@/components/UserForm";
import { UserActions } from "@/components/UserActions";
import { UserPlus, UserX, CheckCircle } from "lucide-react";

export default async function AdminUsersPage() {
  const users = await fetchUsers();
  const shifts = await fetchShifts();

  // Função inline (server action) para desativar/ativar
  const handleToggle = async (formData: FormData) => {
    "use server";
    const id = formData.get("id") as string;
    const active = formData.get("active") === "true";
    
    await toggleUserStatus(id, active);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Gestão de Usuários</h1>
          <p className="text-zinc-400">Cadastre e gerencie o acesso da sua equipe.</p>
        </div>
        
        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-4 py-2">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Usuário</DialogTitle>
            </DialogHeader>
            <UserForm shifts={shifts} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Perfil</th>
                  <th className="px-6 py-4">Escala</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      Nenhum usuário encontrado no banco de dados.
                    </td>
                  </tr>
                ) : (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  users.map((user: any) => (
                    <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="px-6 py-4 font-medium text-zinc-200">{user.name}</td>
                      <td className="px-6 py-4 text-zinc-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          {user.role === 'admin' ? 'Administrador' : 'Funcionário'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{user.shifts?.name || '-'}</td>
                      <td className="px-6 py-4">
                        {user.active ? (
                          <span className="flex items-center text-emerald-400 text-xs"><CheckCircle className="w-3 h-3 mr-1"/> Ativo</span>
                        ) : (
                          <span className="flex items-center text-zinc-500 text-xs"><UserX className="w-3 h-3 mr-1"/> Desativado</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <UserActions userId={user.id} userName={user.name} />
                          <form action={handleToggle}>
                            <input type="hidden" name="id" value={user.id} />
                            <input type="hidden" name="active" value={String(user.active)} />
                            <Button 
                              type="submit" 
                              variant="ghost" 
                              size="sm"
                              className={user.active ? "text-amber-500 hover:text-amber-400 hover:bg-amber-500/10" : "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"}
                            >
                              {user.active ? "Desativar" : "Ativar"}
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
