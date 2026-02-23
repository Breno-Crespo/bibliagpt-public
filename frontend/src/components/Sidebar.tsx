"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus, Trash2, LogOut } from "lucide-react";
import { supabase } from "../utils/supabase";
import { useRouter } from "next/navigation";
import { chatService } from "../services/chatService"; // ✅ Usando nosso serviço seguro

type ChatItem = {
  id: string;
  title: string;
};

interface SidebarProps {
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  selectedChatId: string | null;
  userId: string; 
}

export default function Sidebar({ onSelectChat, onNewChat, selectedChatId }: SidebarProps) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const router = useRouter();
  
  // ✅ Busca os chats assim que o componente carrega ou quando um novo é selecionado
  useEffect(() => {
    fetchChats();
  }, [selectedChatId]); 

  const fetchChats = async () => {
    try {
      // ✅ Agora usamos o serviço que envia o TOKEN no cabeçalho
      // O backend descobre quem é o usuário sozinho!
      const data = await chatService.getChats();
      setChats(data);
    } catch (error) {
      console.error("Erro ao buscar chats:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja apagar este estudo?")) return;

    try {
      // ✅ Usando o serviço seguro para deletar
      await chatService.deleteChat(id);
      setChats(prev => prev.filter(chat => chat.id !== id));
      if (selectedChatId === id) onNewChat();
    } catch (error) {
      console.error("Erro ao apagar conversa:", error);
      alert("Erro ao apagar conversa.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-[#2C1810] h-screen shadow-xl z-10">
      
      {/* Cabeçalho */}
      <div className="p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-serif font-bold text-[#E8DCC3] tracking-wide">
          BibliaGPT
        </h1>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-[#C5A059] text-[#2C1810] p-3 rounded-lg hover:bg-[#D4AF6A] transition-all shadow-md font-bold text-sm uppercase tracking-wider"
        >
          <Plus size={18} strokeWidth={3} />
          Nova Conversa
        </button>
      </div>

      {/* Lista de Conversas */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        <div className="text-[#E8DCC3] opacity-50 text-xs font-bold uppercase tracking-wider px-3 mb-2">
          Seus Estudos
        </div>
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`group w-full p-3 rounded-lg text-sm flex items-center justify-between cursor-pointer transition-all ${
              selectedChatId === chat.id
                ? "bg-[#3E2B22] text-[#E8DCC3] font-medium shadow-inner"
                : "text-[#C0B4A5] hover:bg-[#3E2B22] hover:text-[#E8DCC3]"
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare size={18} className="shrink-0 opacity-80" />
              <span className="truncate">{chat.title}</span>
            </div>
            
            <button
              onClick={(e) => handleDelete(e, chat.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-[#C0B4A5] hover:text-red-400 hover:bg-[#2C1810] rounded transition-all"
              title="Apagar"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      
      {/* Rodapé com Logout */}
      <div className="p-4 border-t border-[#3E2B22]">
        <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[#C0B4A5] hover:text-white text-xs uppercase font-bold tracking-wider w-full justify-center opacity-70 hover:opacity-100 transition-opacity"
        >
            <LogOut size={14} /> Sair do Sistema
        </button>
      </div>
    </div>
  );
}