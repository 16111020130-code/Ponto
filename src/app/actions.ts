"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function registerPunch(type: 'entrada' | 'saida' | 'saida_almoco' | 'volta_almoco', justification?: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Usuário não autenticado");
  }

  const userId = session.user.id;
  
  if (userId === "1") {
    // É o admin de fallback, ignora escrita real
    console.log("Admin fallback bateu ponto.");
    return { success: true };
  }

  const { error } = await supabase
    .from('time_records')
    .insert([
      {
        user_id: userId,
        punch_time: new Date().toISOString(),
        punch_type: type,
        justification: justification || null,
        source: 'manual'
      }
    ]);

  if (error) {
    console.error("Erro ao registrar ponto:", error);
    throw new Error("Erro ao registrar ponto");
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function fetchTodayRecords() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return [];
  }
  
  const userId = session.user.id;

  if (userId === "1") {
    return [];
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('time_records')
    .select('*')
    .eq('user_id', userId)
    .gte('punch_time', startOfDay.toISOString())
    .order('punch_time', { ascending: false });

  if (error) {
    console.error("Erro ao buscar registros:", error);
    return [];
  }

  return data;
}
