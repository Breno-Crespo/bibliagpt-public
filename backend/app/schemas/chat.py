from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    message: str          # Texto da pergunta
    chat_id: Optional[str] = None
    foco: str = "Devocional"

class ChatResponse(BaseModel):
    response: str
    audio_url: Optional[str] = None
    chat_id: str
    motor: str