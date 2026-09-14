"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Verifica se o usuário atual é admin
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Acesso negado");
  }
}

export async function fetchUsers() {
  await checkAdmin();
  
  const { data, error } = await supabase
    .from('users')
    .select(`
      id, name, email, role, active,
      shifts ( name )
    `)
    .order('name');

  if (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
  
  return data;
}

export async function fetchShifts() {
  await checkAdmin();
  
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .order('name');
    
  if (error) return [];
  return data;
}

export async function createUser(data: { name: string; email: string; password?: string; role: string; shift_id?: string }) {
  await checkAdmin();
  
  const { name, email, password, role, shift_id } = data;
  
  // Em produção a senha seria hasteada (bcrypt)
  const { error } = await supabase
    .from('users')
    .insert([
      {
        name,
        email,
        password_hash: password,
        role,
        shift_id: shift_id || null,
        active: true
      }
    ]);
    
  if (error) {
    console.error("Erro ao criar usuário:", error);
    throw new Error("Não foi possível criar o usuário. E-mail pode já estar em uso.");
  }
  
  revalidatePath('/admin/users');
  return { success: true };
}

export async function toggleUserStatus(userId: string, active: boolean) {
  await checkAdmin();
  
  const { error } = await supabase
    .from('users')
    .update({ active: !active })
    .eq('id', userId);
    
  if (error) {
    throw new Error("Erro ao atualizar status do usuário");
  }
  
  revalidatePath('/admin/users');
  return { success: true };
}

export async function fetchUserRecords(userId: string) {
  await checkAdmin();
  
  const { data, error } = await supabase
    .from('time_records')
    .select('*')
    .eq('user_id', userId)
    .order('punch_time', { ascending: false });

  if (error) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }
  
  return data;
}

export async function deleteTimeRecord(recordId: string) {
  await checkAdmin();
  
  const { error } = await supabase
    .from('time_records')
    .delete()
    .eq('id', recordId);
    
  if (error) {
    throw new Error("Erro ao excluir o registro de ponto.");
  }
  
  return { success: true };
}

export async function changeUserPassword(userId: string, newPassword: string) {
  await checkAdmin();
  
  const { error } = await supabase
    .from('users')
    .update({ password_hash: newPassword })
    .eq('id', userId);
    
  if (error) {
    throw new Error("Erro ao alterar a senha.");
  }
  
  return { success: true };
}

export async function adminRegisterPunch(data: { userId: string, punch_time: string, punch_type: string, justification?: string }) {
  await checkAdmin();
  
  const { userId, punch_time, punch_type, justification } = data;
  
  const { error } = await supabase
    .from('time_records')
    .insert([
      {
        user_id: userId,
        punch_time: punch_time, // ISO String provided from frontend
        punch_type: punch_type,
        justification: justification || null,
        source: 'admin_manual'
      }
    ]);

  if (error) {
    console.error("Erro ao registrar ponto como admin:", error);
    throw new Error("Erro ao registrar ponto manualmente.");
  }

  // Not revalidating the whole page to avoid closing modals if we rely on local state, but usually revalidatePath('/admin/users') is fine.
  // We'll let the client refetch history or handle it.
  return { success: true };
}

