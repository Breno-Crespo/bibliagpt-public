from fastapi import APIRouter, Depends, HTTPException
from backend.app.schemas.chat import ChatRequest, ChatResponse
from backend.app.services.agents import get_supervisor_chain, get_agente_web, get_agente_rag
from backend.app.services.audio import text_to_speech
from backend.app.services.database import create_chat, save_message, get_chat_history, get_all_chats, delete_chat_db
from backend.app.core.deps import get_current_user

router = APIRouter()

@router.post("/message")
async def chat_endpoint(request: ChatRequest, user_id: str = Depends(get_current_user)):
    """Rota para enviar mensagens. Exige o Token (crachá) do usuário."""
    try:
        chat_id = request.chat_id
        
        # 1. Se não tem chat_id, cria um novo vinculado ao usuário seguro
        if not chat_id:
            titulo = request.message[:30] + "..."
            # Usamos o user_id que veio do Token, impossível de falsificar
            chat_id = create_chat(titulo, user_id)

        # 2. Carrega histórico
        history_db = get_chat_history(chat_id)
        langchain_history = []
        
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

        # 6. Salva tudo no banco (usando o user_id validado)
        save_message(chat_id, "user", request.message, user_id)
        save_message(chat_id, "assistant", resposta_texto, user_id, audio_url)

        return ChatResponse(
            response=resposta_texto,
            audio_url=audio_url,
            chat_id=chat_id,
            motor=motor
        )

    except Exception as e:
        print(f"Erro: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{chat_id}")
async def history_endpoint(chat_id: str, user_id: str = Depends(get_current_user)):
    """Busca o histórico protegido por Token."""
    return get_chat_history(chat_id)

@router.get("/list")
async def list_chats_endpoint(user_id: str = Depends(get_current_user)):
    """
    Lista todos os chats do usuário. 
    A MÁGICA: O FastAPI pega o token no cabeçalho, descobre quem é o user_id sozinho e entrega aqui!
    """
    return get_all_chats(user_id)

@router.delete("/delete/{chat_id}")
async def delete_chat_endpoint(chat_id: str, user_id: str = Depends(get_current_user)):
    """Deleta um chat específico, exigindo autenticação."""
    sucesso = delete_chat_db(chat_id)
    return {"status": "deleted" if sucesso else "error"}