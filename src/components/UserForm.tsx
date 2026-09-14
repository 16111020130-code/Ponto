"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUser } from "@/app/admin-actions";

const userSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["admin", "employee"]),
  shift_id: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  shifts: { id: string; name: string }[];
}

export function UserForm({ shifts }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "employee"
    }
  });

  const role = watch("role");

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true);
    setError("");
    try {
      await createUser(data);
      window.location.reload();
    } catch (err: unknown) {
      setError((err as Error).message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div className="space-y-2">
        <Label>Nome Completo</Label>
        <Input {...register("name")} className="bg-zinc-900 border-zinc-700" placeholder="João da Silva" />
        {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
      </div>

      <div className="space-y-2">
        <Label>E-mail (Login)</Label>
        <Input type="email" {...register("email")} className="bg-zinc-900 border-zinc-700" placeholder="joao@ponto.com" />
        {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
      </div>

      <div className="space-y-2">
        <Label>Senha Temporária</Label>
        <Input type="text" {...register("password")} className="bg-zinc-900 border-zinc-700" placeholder="senha123" />
        {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
      </div>

      <div className="space-y-2">
        <Label>Perfil de Acesso</Label>
        <Select onValueChange={(v) => setValue("role", (v as "admin" | "employee") || "employee")} defaultValue="employee">
          <SelectTrigger className="bg-zinc-900 border-zinc-700">
            <SelectValue placeholder="Selecione o perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Funcionário</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {role === "employee" && (
        <div className="space-y-2">
          <Label>Escala de Trabalho</Label>
          <Select onValueChange={(v) => setValue("shift_id", v as string)}>
            <SelectTrigger className="bg-zinc-900 border-zinc-700">
              <SelectValue placeholder="Selecione a escala" />
            </SelectTrigger>
            <SelectContent>
              {shifts.map(shift => (
                <SelectItem key={shift.id} value={shift.id}>{shift.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
        {loading ? "Salvando..." : "Criar Usuário"}
      </Button>
    </form>
  );
}
