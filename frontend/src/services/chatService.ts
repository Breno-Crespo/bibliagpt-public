import { supabase } from '../utils/supabase';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    headers: {
      Authorization: `Bearer ${session?.access_token}`
    }
  };
};

const sendMessage = async (mensagem: string, chatId: string | null, foco: string) => {
  const auth = await getAuthHeaders();
  
  const response = await axios.post(
    `${API_BASE_URL}/chat/message`,
    {
      message: mensagem, 
      chat_id: chatId,
      foco: foco
    },
    auth
  );
  return response.data;
};

const getChats = async (chatId?: string) => {
  const auth = await getAuthHeaders();
  
  // Se houver um chatId, busca o histórico específico. Se não, lista todos.
  const url = chatId 
    ? `${API_BASE_URL}/chat/history/${chatId}` 
    : `${API_BASE_URL}/chat/list`;
    
  const response = await axios.get(url, auth);
  return response.data;
};

// ... mantenha as outras funções ...

export const chatService = {
  sendMessage,
  getChats,
  getHistory: getChats, // Agora aceita 1 argumento opcional corretamente
  deleteChat: async (chatId: string) => {
    const auth = await getAuthHeaders();
    const response = await axios.delete(`${API_BASE_URL}/chat/delete/${chatId}`, auth);
    return response.data;
  }};