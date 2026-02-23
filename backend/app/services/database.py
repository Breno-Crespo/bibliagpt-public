from backend.app.core.deps import get_supabase

supabase = get_supabase()

def create_chat(title: str, user_id: str):
    """Cria um novo chat vinculado ao usuário"""
    data = {"title": title, "user_id": user_id}
    response = supabase.table("chats").insert(data).execute()
    return response.data[0]["id"]

def save_message(chat_id: str, role: str, content: str, user_id: str, audio_url: str = None):
    """Salva mensagem vinculada ao usuário"""
    data = {
        "chat_id": chat_id,
        "role": role,
        "content": content,
        "user_id": user_id,  # Importante: Salva o dono da mensagem
        "audio_url": audio_url
    }
    supabase.table("messages").insert(data).execute()

def get_chat_history(chat_id: str):
    response = supabase.table("messages").select("*").eq("chat_id", chat_id).order("created_at", desc=False).execute()
    return response.data

def get_all_chats(user_id: str):
    """Busca APENAS os chats daquele usuário específico"""
    if not user_id:
        return []
    # Filtra por user_id para garantir privacidade
    response = supabase.table("chats").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return response.data

def delete_chat_db(chat_id: str):
    try:
        supabase.table("chats").delete().eq("id", chat_id).execute()
        return True
    except Exception as e:
        print(f"Erro ao deletar: {e}")
        return False