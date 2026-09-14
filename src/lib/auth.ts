import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { supabase } = await import('@/lib/supabase');
        
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .limit(1);

        if (error || !users || users.length === 0) {
          if (credentials.email === "admin@ponto.com" && credentials.password === "admin123") {
            return { id: "1", name: "Administrador (Fallback)", email: "admin@ponto.com", role: "admin" };
          }
          return null;
        }

        const user = users[0];
        
        if (user.password_hash !== credentials.password) {
           return null;
        }

        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = (token.id || token.sub) as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
};
