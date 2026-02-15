import edge_tts
import uuid
import os

# Define onde os arquivos de áudio serão salvos
# Como você roda o uvicorn da raiz, o caminho é backend/static
AUDIO_DIR = "backend/static"

async def text_to_speech(text: str) -> str:
    """Converte texto em áudio usando a voz da Francisca (Neural)"""
    if not text:
        return None
    
    # Limita o tamanho do texto para o áudio não ficar gigante e demorado
    # (Para MVP, vamos limitar a introdução ou resumo)
    texto_falado = text[:300] + "..." if len(text) > 300 else text

    try:
        # Garante que a pasta existe
        os.makedirs(AUDIO_DIR, exist_ok=True)

        # Gera um nome único para o arquivo
        filename = f"{uuid.uuid4()}.mp3"
        file_path = f"{AUDIO_DIR}/{filename}"

        # Gera o áudio
        communicate = edge_tts.Communicate(texto_falado, "pt-BR-FranciscaNeural")
        await communicate.save(file_path)

        # Retorna a URL pública do áudio (ex: /static/nome-do-arquivo.mp3)
        return f"/static/{filename}"
    
    except Exception as e:
        print(f"Erro ao gerar áudio: {e}")
        return None