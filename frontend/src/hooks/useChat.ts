import { useState, useRef, useEffect, useCallback } from "react";
import { Message, ModoKey } from "../types/chat";
import { chatService } from "../services/chatService";

interface UseChatOptions {
    activeChatId: string | null;
    onChatCreated?: (id: string) => void;
    userId: string; // Mantemos aqui apenas para compatibilidade de interface, se necessário
}

export function useChat({ activeChatId, onChatCreated }: UseChatOptions) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [foco, setFoco] = useState<ModoKey>("Devocional");

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ✅ MELHORIA: getHistory agora não precisa de userId, o Token resolve
    const loadHistory = useCallback(async (chatId: string) => {
        setLoading(true);
        try {
            const history = await chatService.getHistory(chatId);
            if (history && history.length > 0) setMessages(history);
        } catch (error) {
            console.error("Erro histórico:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeChatId) {
            loadHistory(activeChatId);
        } else {
            setMessages([]);
        }
    }, [activeChatId, loadHistory]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (textOverride?: string) => {
    const textoFinal = textOverride || input;
    if (!textoFinal.trim() || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: textoFinal }]);
    setLoading(true);

    try {
        // ✅ Chamada limpa enviando apenas os 3 argumentos que o service espera
        const data = await chatService.sendMessage(
            textoFinal, 
            activeChatId, 
            foco
        );

        if (!activeChatId && data.chat_id && onChatCreated) {
            onChatCreated(data.chat_id);
        }
        
        setMessages((prev) => [
            ...prev,
            { 
                role: "assistant", 
                content: data.response, 
                audioUrl: data.audio_url || data.audioUrl 
            },
        ]);
    } catch (error) {
        setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "⚠️ Erro de conexão." },
        ]);
    } finally {
        setLoading(false);
    }
};
    return {
        messages,
        input,
        setInput,
        loading,
        foco,
        setFoco,
        messagesEndRef,
        sendMessage,
    };
}