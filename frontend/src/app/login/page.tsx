"use client";

import { useState } from "react";
import { supabase } from "../../utils/supabase"; // Importação corrigida
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Verifique seu e-mail para confirmar o cadastro!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-[#E6DCC3]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F7F5F0] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E6DCC3]">
            <Sparkles size={32} className="text-[#C5A059]" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#5C4033]">
            {isSignUp ? "Criar Conta" : "Bem-vindo"}
          </h1>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#8C7B70] uppercase mb-1">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-[#F9F7F2] border border-[#E6DCC3] rounded-lg outline-none focus:border-[#C5A059]" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8C7B70] uppercase mb-1">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-[#F9F7F2] border border-[#E6DCC3] rounded-lg outline-none focus:border-[#C5A059]" required minLength={6} />
          </div>
          <button disabled={loading} className="w-full bg-[#C5A059] text-white p-3 rounded-lg font-bold hover:bg-[#B8860B] transition-all flex items-center justify-center gap-2">
            {loading ? "Processando..." : (isSignUp ? "Cadastrar" : "Entrar")}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-[#5C4033] underline hover:text-[#C5A059]">
            {isSignUp ? "Já tem conta? Faça login" : "Não tem conta? Cadastre-se"}
          </button>
        </div>
      </div>
    </div>
  );
}