import edge_tts
import uuid
import os
import re

AUDIO_DIR = "backend/static"

async def text_to_speech(text: str) -> str:
    if not text:
        return None
    
    # --- 1. LIMPEZA DE MARKDOWN ---
    texto_limpo = re.sub(r'[*#_`]', '', text)
    
    # --- 2. CORREÇÃO DE VERSÍCULOS ---
    texto_falado = re.sub(r'(\d+):(\d+)', r'\1 versículo \2', texto_limpo)

    try:
        os.makedirs(AUDIO_DIR, exist_ok=True)
        filename = f"{uuid.uuid4()}.mp3"
        file_path = f"{AUDIO_DIR}/{filename}"

        # Gera o áudio com o texto já corrigido
        communicate = edge_tts.Communicate(texto_falado, "pt-BR-FranciscaNeural")
        await communicate.save(file_path)

        return f"/static/{filename}"
    
    except Exception as e:
        print(f"Erro ao gerar áudio: {e}")
        return None