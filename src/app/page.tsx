import { redirect } from "next/navigation";

export default function Home() {
  // Redireciona a página inicial direto para o Dashboard
  redirect("/dashboard");
}
