from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from backend.app.services.agents import get_supervisor_chain, get_agente_web, get_agente_rag
from langchain_core.messages import HumanMessage, AIMessage
from backend.app.services.database import create_chat, save_message, get_chat_history, get_all_chats, delete_chat_db
import uuid
import os
import edge_tts

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    chat_id: Optional[str] = None # Agora aceitamos um ID de conversa!
    foco: str = "Devocional"

async def gerar_arquivo_audio(texto):
    # ... (Mantenha sua função de áudio IGUAL, não precisa mudar) ...
    try:
        pasta_static = "backend/static"
        if not os.path.exists(pasta_static): os.makedirs(pasta_static)
        texto_limpo = texto.replace("**", "").replace("#", "").replace("📖", "")
        communicate = edge_tts.Communicate(texto_limpo, "pt-BR-FranciscaNeural")
        filename = f"audio_{uuid.uuid4()}.mp3"
        filepath = os.path.join(pasta_static, filename)
        await communicate.save(filepath)
        return f"http://127.0.0.1:8000/static/{filename}"
    except: return None

from backend.app.services.database import create_chat, save_message, get_chat_history, get_all_chats # <--- Adicione get_all_chats

# ... (Mantenha os imports e classes anteriores) ...

# 1. Rota para Listar Conversas (Sidebar)
@router.get("/list")
async def list_chats_endpoint():
    chats = get_all_chats()
    return chats

# 2. Rota para Carregar uma Conversa Antiga
@router.get("/history/{chat_id}")
async def get_history_endpoint(chat_id: str):
    # Busca do banco
    raw_history = get_chat_history(chat_id)
    
    # Formata para o Frontend
    formatted_history = []
    for msg in raw_history:
        formatted_history.append({
            "role": msg["role"],
            "content": msg["content"],
            # Se tiver áudio salvo no futuro, viria aqui. Por enquanto vai sem.
        })
    return formatted_history

@router.delete("/delete/{chat_id}")
async def delete_chat_endpoint(chat_id: str):
    sucesso = delete_chat_db(chat_id)
    return {"status": "deleted" if sucesso else "error"}
@router.post("/message")
async def chat_endpoint(request: ChatRequest):
    try:
        # 1. Gerenciamento do ID da Conversa
        current_chat_id = request.chat_id
        
        # Se não veio ID, criamos uma nova conversa no banco
        if not current_chat_id:
            # Usa as primeiras 30 letras da mensagem como título
            titulo = (request.message[:30] + '..') if len(request.message) > 30 else request.message
            current_chat_id = create_chat(titulo)
        
        # 2. Salvar Mensagem do Usuário no Banco
        if current_chat_id:
            save_message(current_chat_id, "user", request.message)

        # 3. Recuperar Histórico REAL do Banco (Memória Perfeita)
        db_history = []
        if current_chat_id:
            raw_history = get_chat_history(current_chat_id)
            for msg in raw_history:
                if msg['role'] == 'user':
                    db_history.append(HumanMessage(content=msg['content']))
                else:
                    db_history.append(AIMessage(content=msg['content']))
        
        # Se for novo, usa lista vazia
        if not db_history: db_history = []

        # 4. Inteligência (Igual antes)
        supervisor = get_supervisor_chain()
        rota = supervisor.invoke({"input": request.message}).strip()

        if rota == "WEB":
            resposta, agente = get_agente_web(request.message, db_history, request.foco)
        else:
            resposta, agente = get_agente_rag(rota, request.message, db_history, request.foco)

        # 5. Salvar Resposta da IA no Banco
        if current_chat_id:
            save_message(current_chat_id, "assistant", resposta)

        # 6. Áudio
        audio_url = await gerar_arquivo_audio(resposta)

        return {
            "response": resposta,
            "agent": agente,
            "route": rota,
            "audio_url": audio_url,
            "chat_id": current_chat_id # Devolvemos o ID pro Frontend lembrar!
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))