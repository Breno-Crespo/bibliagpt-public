import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("❌ ERRO: SUPABASE_URL e SUPABASE_KEY são obrigatórios no .env")

supabase: Client = create_client(url, key)

def create_chat(title: str):
    """Cria uma nova conversa e retorna o ID"""
    try:
        data = {"title": title}
        response = supabase.table("chats").insert(data).execute()
        # O supabase retorna uma lista, pegamos o primeiro item
        return response.data[0]['id']
    except Exception as e:
        print(f"Erro ao criar chat: {e}")
        return None

def save_message(chat_id: str, role: str, content: str):
    """Salva uma mensagem no banco"""
    try:
        data = {
            "chat_id": chat_id,
            "role": role,
            "content": content
        }
        supabase.table("messages").insert(data).execute()
    except Exception as e:
        print(f"Erro ao salvar mensagem: {e}")

def get_chat_history(chat_id: str):
    """Recupera o histórico completo de um chat"""
    try:
        response = supabase.table("messages")\
            .select("*")\
            .eq("chat_id", chat_id)\
            .order("created_at", desc=False)\
            .execute()
        return response.data
    except Exception as e:
        print(f"Erro ao buscar histórico: {e}")
        return []
    
def get_all_chats():
    """Retorna lista de todas as conversas (ID e Título)"""
    try:
        # Busca ID, Titulo e Data, ordenado pelo mais recente
        response = supabase.table("chats")\
            .select("id, title, created_at")\
            .order("created_at", desc=True)\
            .execute()
        return response.data
    except Exception as e:
        print(f"Erro ao listar chats: {e}")
        return []
def delete_chat_db(chat_id: str):
    """Remove uma conversa e suas mensagens (Cascade)"""
    try:
        # O Supabase já remove as mensagens automaticamente se configuramos CASCADE no SQL
        # Mas garantimos deletando o chat pai.
        supabase.table("chats").delete().eq("id", chat_id).execute()
        return True
    except Exception as e:
        print(f"Erro ao deletar chat: {e}")
        return False