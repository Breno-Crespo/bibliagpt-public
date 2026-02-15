from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from backend.app.services.agents import get_supervisor_chain, get_agente_web, get_agente_rag
from backend.app.services.audio import text_to_speech
from backend.app.services.database import create_chat, save_message, get_chat_history, get_all_chats, delete_chat_db

router = APIRouter()

# Atualizamos o modelo para exigir user_id
class ChatRequest(BaseModel):
    message: str
    chat_id: Optional[str] = None
    foco: str = "Devocional"
    user_id: str  # Campo novo obrigatório!

@router.post("/message")
async def chat_endpoint(request: ChatRequest):
    try:
        chat_id = request.chat_id
        
        # 1. Se não tem chat_id, cria um novo vinculado ao usuário
        if not chat_id:
            titulo = request.message[:30] + "..."
            chat_id = create_chat(titulo, request.user_id)

        # 2. Carrega histórico
        history_db = get_chat_history(chat_id)
        langchain_history = []
        # Convertendo histórico para formato do LangChain (opcional, simplificado aqui)
        
        # 3. Decide a rota (Supervisor)
        supervisor = get_supervisor_chain()
        rota = supervisor.invoke({"input": request.message})
        
        # 4. Gera a resposta
        if "WEB" in rota:
            resposta_texto, motor = get_agente_web(request.message, langchain_history, request.foco)
        else:
            resposta_texto, motor = get_agente_rag(rota, request.message, langchain_history, request.foco)

        # 5. Gera Áudio
        audio_url = await text_to_speech(resposta_texto)

        # 6. Salva tudo no banco (com user_id)
        save_message(chat_id, "user", request.message, request.user_id)
        save_message(chat_id, "assistant", resposta_texto, request.user_id, audio_url)

        return {
            "response": resposta_texto,
            "audio_url": audio_url,
            "chat_id": chat_id,
            "motor": motor
        }

    except Exception as e:
        print(f"Erro: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{chat_id}")
async def history_endpoint(chat_id: str):
    return get_chat_history(chat_id)

# Agora a lista de chats pede o user_id para filtrar
@router.get("/list")
async def list_chats_endpoint(user_id: str):
    return get_all_chats(user_id)

@router.delete("/delete/{chat_id}")
async def delete_chat_endpoint(chat_id: str):
    sucesso = delete_chat_db(chat_id)
    return {"status": "deleted" if sucesso else "error"}