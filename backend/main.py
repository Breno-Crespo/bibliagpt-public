from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # <--- ESSENCIAL
from dotenv import load_dotenv
from backend.app.api import chat
import os

load_dotenv()

app = FastAPI(title="BibliaGPT API")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GARANTIA: Cria a pasta static na inicialização ---
if not os.path.exists("backend/static"):
    os.makedirs("backend/static")

# --- MONTAR A PASTA DE ÁUDIO (ISSO FAZ O LINK FUNCIONAR) ---
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

app.include_router(chat.router, prefix="/chat", tags=["Chat"])

@app.get("/")
def read_root():
    return {"message": "BibliaGPT Backend ON! 🚀"}