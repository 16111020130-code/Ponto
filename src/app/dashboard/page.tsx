"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, LogOut, CheckCircle2 } from "lucide-react";
import { registerPunch, fetchTodayRecords } from "@/app/actions";

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [records, setRecords] = useState<{id: string; punch_type: string; source: string; punch_time: string}[]>([]);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    fetchTodayRecords().then(data => setRecords(data));
    
    return () => clearInterval(interval);
  }, []);

  const handlePunch = async (type: 'entrada' | 'saida' | 'saida_almoco' | 'volta_almoco') => {
    setLoadingAction(true);
    try {
      await registerPunch(type);
      alert(`Registrado com sucesso!`);
      window.location.reload();
    } catch (error: unknown) {
      alert("Erro ao registrar: " + (error as Error).message);
    } finally {
      setLoadingAction(false);
    }
  };

  const getPunchLabel = (type: string) => {
    switch(type) {
      case 'entrada': return 'Entrada';
      case 'saida': return 'Saída';
      case 'saida_almoco': return 'Saída para Almoço';
      case 'volta_almoco': return 'Volta do Almoço';
      default: return type;
    }
  };

  if (!currentTime) return null; // Avoid hydration mismatch

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      
      {/* Relógio Central */}
      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardContent className="flex flex-col items-center justify-center p-12">
          <div className="text-7xl font-bold tracking-tighter text-zinc-100 font-mono">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-zinc-500 mt-2 font-medium">
            {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Ações Rápidas</h2>
        <Card className="border-zinc-800 bg-zinc-950">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => handlePunch('entrada')}
                disabled={loadingAction}
                className="h-24 text-lg bg-emerald-900/30 text-emerald-500 hover:bg-emerald-800/40 hover:text-emerald-400 border border-emerald-900/50 flex flex-col items-center justify-center gap-2"
              >
                <LogIn className="w-6 h-6" />
                Entrada
              </Button>

              <Button 
                onClick={() => handlePunch('saida_almoco')}
                disabled={loadingAction}
                className="h-24 text-lg bg-amber-900/30 text-amber-500 hover:bg-amber-800/40 hover:text-amber-400 border border-amber-900/50 flex flex-col items-center justify-center gap-2"
              >
                <LogOut className="w-6 h-6" />
                Saída p/ Almoço
              </Button>

              <Button 
                onClick={() => handlePunch('volta_almoco')}
                disabled={loadingAction}
                className="h-24 text-lg bg-emerald-900/30 text-emerald-500 hover:bg-emerald-800/40 hover:text-emerald-400 border border-emerald-900/50 flex flex-col items-center justify-center gap-2"
              >
                <LogIn className="w-6 h-6" />
                Volta Almoço
              </Button>

              <Button 
                onClick={() => handlePunch('saida')}
                disabled={loadingAction}
                className="h-24 text-lg bg-blue-900/30 text-blue-500 hover:bg-blue-800/40 hover:text-blue-400 border border-blue-900/50 flex flex-col items-center justify-center gap-2"
              >
                <LogOut className="w-6 h-6" />
                Saída Final
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Resumo */}
      <Card className="border-zinc-800 bg-zinc-900/40 col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Últimos Registros (Hoje)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.length === 0 ? (
              <p className="text-zinc-500 text-center py-4">Nenhum ponto registrado hoje.</p>
            ) : (
              records.map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${r.punch_type.includes('entrada') || r.punch_type.includes('volta') ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                       <CheckCircle2 className={`w-5 h-5 ${r.punch_type.includes('entrada') || r.punch_type.includes('volta') ? 'text-emerald-500' : 'text-amber-500'}`} />
                    </div>
                    <div>
                      <p className="text-zinc-100 font-medium">{getPunchLabel(r.punch_type)}</p>
                      <p className="text-zinc-400 text-sm">Via {r.source === 'manual' ? 'Web' : 'Importação'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-100 font-bold">{new Date(r.punch_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
