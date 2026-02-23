from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from backend.app.core.config import settings # Ajuste o caminho se necessário

# Cria a "fechadura" que vai exigir o token no cabeçalho da requisição
security = HTTPBearer()

def get_supabase() -> Client:
    """Retorna o client do Supabase"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    supabase: Client = Depends(get_supabase)
) -> str:
    """
    Verifica o crachá (Token JWT) do utilizador.
    Retorna o ID do utilizador se for válido, ou bloqueia a entrada se for falso.
    """
    token = credentials.credentials
    try:
        # Pede para o Supabase validar o token
        user_resp = supabase.auth.get_user(token)
        
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Crachá inválido ou expirado.")
            
        return user_resp.user.id
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Acesso não autorizado. Faça login novamente.")