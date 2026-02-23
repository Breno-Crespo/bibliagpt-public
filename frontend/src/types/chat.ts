export type Message = {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
};

export interface ChatProps {
  activeChatId: string | null;
  onChatCreated: (id: string) => void;
  userId: string;
}

export const modosConfig = {
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

export type ModoKey = keyof typeof modosConfig;
