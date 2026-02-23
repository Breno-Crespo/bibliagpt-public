from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from backend.app.api import chat

app = FastAPI()

# Configura CORS para aceitar o Token (Authorization Header)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], # Garante que o Token de segurança possa passar
)

os.makedirs("backend/static", exist_ok=True)
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

# Todas as rotas dentro de chat.py agora começam com /chat
app.include_router(chat.router, prefix="/chat")

@app.get("/")
def read_root():
    return {"message": "BibliaGPT API Online 🚀"}