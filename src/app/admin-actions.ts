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
    .order('timestamp', { ascending: false });

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
