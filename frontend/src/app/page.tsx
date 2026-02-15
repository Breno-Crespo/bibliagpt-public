"use client";

import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar"; // Import recuperado
import ChatInterface from "../components/ChatInterface"; // Import recuperado

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      // Verifica se o usuário está logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login"); // Se não, manda pro login
      } else {
        setUserId(user.id);
      }
    };
    checkUser();
  }, []);

  // Enquanto não carrega o usuário, não mostra nada (evita piscar)
  if (!userId) return null;

  return (
    <div className="flex h-screen bg-[#FDFBF7]">
      {/* Sidebar (Esquerda) */}
      <Sidebar 
          selectedChatId={currentChatId}
            onSelectChat={(id: string) => setCurrentChatId(id)}
            onNewChat={() => setCurrentChatId(null)}
            userId={userId} // <--- Adicione esta linha!
      />

      {/* Área Principal (Direita) */}
      <main className="flex-1 flex flex-col h-screen">
        <ChatInterface 
          activeChatId={currentChatId}
          onChatCreated={(newId: string) => setCurrentChatId(newId)}
          userId={userId} // <--- Passando o ID para o Chat!
        />
      </main>
    </div>
  );
}