"use client";
import { API_BASE_URL } from "../utils/api";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, User, Sparkles, BookOpen, Download, Info, ArrowRight, Lightbulb } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { jsPDF } from "jspdf";


type Message = {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
};

interface ChatProps {
  activeChatId: string | null;
  onChatCreated: (id: string) => void;
  userId: string;
}

// --- CONFIGURAÇÃO DOS MODOS COM EXEMPLOS ---
const modosConfig = {
  "Devocional": {
    titulo: "Devocional",
    desc: "❤️ Para inspiração, paz interior e leitura diária.",
    placeholder: "Ex: Versículo para acalmar a ansiedade...",
    exemplos: [
      "Me dê um versículo de paz",
      "Como lidar com a ansiedade?",
      "Oração pela família",
      "História de esperança na Bíblia"
    ]
  },
  "Teológico": {
    titulo: "Teológico",
    desc: "🧠 Para estudos profundos, história e doutrina.",
    placeholder: "Ex: Qual o contexto histórico de Romanos?",
    exemplos: [
      "Quem escreveu o livro de Hebreus?",
      "Contexto histórico de Paulo",
      "Diferença: Justificação x Santificação",
      "Significado de 'Logos' em João 1"
    ]
  },
  "Pastoral": {
    titulo: "Pastoral",
    desc: "🤝 Conselhos práticos para relacionamentos e vida.",
    placeholder: "Ex: Como lidar com conflitos no casamento?",
    exemplos: [
      "Como perdoar alguém que me feriu?",
      "Conselhos para recém-casados",
      "Lidando com o luto",
      "Como vencer a procrastinação?"
    ]
  }
};

type ModoKey = keyof typeof modosConfig;

export default function ChatInterface({ activeChatId, onChatCreated, userId }: ChatProps) {
  // Começamos VAZIO para mostrar a tela de boas-vindas
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [foco, setFoco] = useState<ModoKey>("Devocional");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeChatId) {
      loadHistory(activeChatId);
    } else {
      setMessages([]); // Limpa se for nova conversa
    }
  }, [activeChatId]);

  const loadHistory = async (chatId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/history/${chatId}`);
      if (response.data.length > 0) setMessages(response.data);
    } catch (error) {
      console.error("Erro histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("times", "bold"); doc.setFontSize(22); doc.text("Estudo BibliaGPT", 20, 20);
    doc.setFontSize(12); doc.setFont("helvetica", "normal"); doc.text(`Modo: ${foco}`, 20, 30); doc.text(`Data: ${new Date().toLocaleDateString()}`, 20, 36);
    let y = 50;
    messages.forEach((msg) => {
      if (msg.role === "user") {
        doc.setFont("helvetica", "bold"); doc.setTextColor(92, 64, 51); doc.text("Pergunta:", 20, y); y += 6;
        doc.setFont("helvetica", "normal"); doc.setTextColor(0, 0, 0);
      } else {
        doc.setFont("helvetica", "bold"); doc.setTextColor(197, 160, 89); doc.text("Conselheira:", 20, y); y += 6;
        doc.setFont("times", "normal");
      }
      const splitText = doc.splitTextToSize(msg.content.replace(/\*\*/g, ""), 170);
      doc.text(splitText, 20, y); y += (splitText.length * 7) + 10;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save("Estudo_Biblico.pdf");
  };

  // Aceita texto opcional para quando clicar nos cartões
  const sendMessage = async (textOverride?: string) => {
    const textoFinal = textOverride || input;
    if (!textoFinal.trim() || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: textoFinal }]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/message`, { 
    message: textoFinal, 
    chat_id: activeChatId, 
    foco: foco,
    user_id: userId // <--- Enviando para o Backend
});
      const data = response.data;
      if (!activeChatId && data.chat_id) onChatCreated(data.chat_id);
      setMessages((prev) => [...prev, { role: "assistant", content: data.response, audioUrl: data.audio_url }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Erro de conexão." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F9F7F2]">
      
      {/* Cabeçalho */}
      <div className="px-6 py-4 bg-white border-b border-[#E6DCC3] flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm gap-4 z-10">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-[#F7F5F0] rounded-lg text-[#C5A059]">
             <BookOpen size={24} />
           </div>
           <div>
             <h2 className="text-[#5C4033] font-bold text-xl font-serif tracking-tight">
               {activeChatId ? "Estudo em Aberto" : "Novo Estudo"}
             </h2>
           </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#F7F5F0] p-1.5 rounded-lg border border-[#E6DCC3]">
                <span className="text-xs text-[#8C7B70] font-bold uppercase tracking-wider pl-2">Modo:</span>
                <select
                    value={foco}
                    onChange={(e) => setFoco(e.target.value as ModoKey)}
                    className="bg-transparent text-[#5C4033] font-semibold text-sm py-1 px-2 rounded focus:outline-none cursor-pointer"
                    disabled={loading || messages.length > 0} // Trava modo se já começou conversa para manter coerência
                >
                    {Object.keys(modosConfig).map((key) => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                </select>
              </div>

              {messages.length > 1 && (
                  <button onClick={handleDownloadPDF} className="bg-[#5C4033] text-white p-2 rounded-lg hover:bg-[#3E2b22]" title="PDF">
                      <Download size={18} />
                  </button>
              )}
          </div>
          <span className="text-[11px] text-[#8C7B70] font-medium flex items-center gap-1 bg-[#F9F7F2] px-2 py-0.5 rounded-md border border-[#E6DCC3]/50">
             <Info size={10} /> {modosConfig[foco].desc}
          </span>
        </div>
      </div>

      {/* --- ÁREA DE CONTEÚDO --- */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        
        {/* OPÇÃO 1: TELA DE BOAS-VINDAS (Se não tem mensagens) */}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
            
            {/* Ícone e Título */}
            <div className="space-y-4 max-w-lg">
              <div className="w-20 h-20 bg-[#F7F5F0] rounded-full flex items-center justify-center mx-auto shadow-sm border border-[#E6DCC3]">
                <Sparkles size={40} className="text-[#C5A059]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#5C4033]">
                Bem-vindo ao BibliaGPT
              </h1>
              <p className="text-[#8C7B70] text-lg">
                Sua conselheira espiritual com inteligência artificial.<br/>
                Escolha um tema abaixo para começar:
              </p>
            </div>

            {/* Cards de Sugestão (Dinâmicos conforme o Foco) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
              {modosConfig[foco].exemplos.map((exemplo, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(exemplo)}
                  className="group flex items-center justify-between p-4 bg-white border border-[#E6DCC3] rounded-xl hover:border-[#C5A059] hover:shadow-md transition-all text-left"
                >
                  <span className="text-[#5C4033] font-medium">{exemplo}</span>
                  <ArrowRight size={18} className="text-[#C5A059] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-[#8C7B70] opacity-60">
               <Lightbulb size={12} />
               <span>Dica: Mude o "Modo" no topo para ver outras sugestões.</span>
            </div>

          </div>
        ) : (
        
        /* OPÇÃO 2: LISTA DE MENSAGENS (Chat Normal) */
          <div className="max-w-3xl mx-auto space-y-8 pb-4">
              {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] md:max-w-[80%] p-5 rounded-2xl shadow-sm ${msg.role === "user" ? "bg-[#EBE5CE] text-[#5C4033] rounded-tr-sm" : "bg-white text-[#2c3e50] border-l-[6px] border-[#C5A059] rounded-tl-sm"}`}>
                  <div className="flex items-center gap-2 mb-3 opacity-70 text-xs font-bold uppercase tracking-widest">
                      {msg.role === "user" ? <User size={14} /> : <Sparkles size={14} className="text-[#C5A059]" />}
                      <span>{msg.role === "user" ? "Você" : "Conselheira"}</span>
                  </div>
                  <div className="leading-relaxed text-[16px] markdown-content">
                      {msg.role === "assistant" ? (
                      <ReactMarkdown components={{ strong: ({node, ...props}) => <span className="font-bold text-[#8B4513]" {...props} />, ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />, li: ({node, ...props}) => <li className="pl-1" {...props} /> }}>{msg.content}</ReactMarkdown>
                      ) : ( <p className="whitespace-pre-wrap font-medium">{msg.content}</p> )}
                  </div>
                  {msg.audioUrl && (
                      <div className="mt-5 pt-4 border-t border-[#F0EAE0]">
                      <audio controls src={msg.audioUrl} className="w-full h-10 rounded-lg shadow-sm" />
                      </div>
                  )}
                  </div>
              </div>
              ))}
              {loading && <div className="flex justify-start animate-pulse"><div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E6DCC3] flex items-center gap-3"><Sparkles size={20} className="text-[#C5A059] animate-spin" /><span className="text-[#8C7B70] font-medium">Consultando sabedoria...</span></div></div>}
              <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-[#E6DCC3]">
        <div className="max-w-3xl mx-auto flex gap-3 items-center relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={modosConfig[foco].placeholder} 
            className="flex-1 p-4 bg-[#F9F7F2] border-2 border-[#E6DCC3] rounded-xl focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all text-[#333] placeholder-[#A09080] font-medium shadow-inner"
            disabled={loading}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="absolute right-3 p-2.5 bg-[#C5A059] text-white rounded-lg hover:bg-[#B8860B] transition-all shadow-md disabled:opacity-50 disabled:hover:bg-[#C5A059] active:scale-95"><Send size={22} strokeWidth={2.5} /></button>
        </div>
      </div>
    </div>
  );
}