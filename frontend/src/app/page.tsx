"use client";

import { useState } from "react";
import ChatInterface from "../components/ChatInterface";
import Sidebar from "../components/Sidebar";

export default function Home() {
  // O estado do ID agora vive AQUI, no pai de todos
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-[#FDFBF7]">
      
      {/* 1. Sidebar (Esquerda) */}
      <Sidebar 
        selectedChatId={currentChatId}
        onSelectChat={(id) => setCurrentChatId(id)}
        onNewChat={() => setCurrentChatId(null)}
      />

      {/* 2. Área Principal (Direita) */}
      <main className="flex-1 flex flex-col h-screen">
        {/* Passamos o ID para o chat saber o que carregar */}
        <ChatInterface 
          activeChatId={currentChatId} 
          onChatCreated={(newId) => setCurrentChatId(newId)}
        />
      </main>

    </div>
  );
}