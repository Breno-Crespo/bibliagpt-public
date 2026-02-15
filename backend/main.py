from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # <--- Importante
import os
from backend.app.api import chat
# Se você configurou o rate limit, mantenha os imports dele aqui
# from slowapi import ...

app = FastAPI()

# Configura CORS (Permite que o Frontend converse com o Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, troque pelo seu link da Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NOVO: Configura a pasta de arquivos estáticos (Áudio) ---
# Cria a pasta se não existir
os.makedirs("backend/static", exist_ok=True)

# "Monta" a pasta para ser acessível via URL
app.mount("/static", StaticFiles(directory="backend/static"), name="static")
# -------------------------------------------------------------

app.include_router(chat.router, prefix="/chat")

@app.get("/")
def read_root():
    return {"message": "BibliaGPT API Online 🚀"}