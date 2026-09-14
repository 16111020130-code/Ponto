import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-10 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-500" />
            <span className="font-semibold text-zinc-100 hidden sm:inline-block">Ponto Eletrônico</span>
          </div>
          <div className="flex items-center gap-4">
            {session.user?.role === 'admin' && (
              <>
                <a 
                  href="/admin/users" 
                  className="px-3 py-1.5 text-sm font-medium bg-zinc-800 text-zinc-100 rounded-md hover:bg-zinc-700 transition-colors"
                >
                  Gerenciar Usuários
                </a>
                <a 
                  href="/admin/import" 
                  className="px-3 py-1.5 text-sm font-medium bg-emerald-600/10 text-emerald-500 rounded-md hover:bg-emerald-600/20 transition-colors mr-2"
                >
                  Importar Excel
                </a>
              </>
            )}
            <div className="text-sm">
              <p className="text-zinc-100 font-medium">{session.user?.name}</p>
              <p className="text-zinc-400 text-xs">{session.user?.role === 'admin' ? 'Administrador' : 'Funcionário'}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
