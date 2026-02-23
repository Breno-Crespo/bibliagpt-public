from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase Settings
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # External APIs
    GROQ_API_KEY: str
    PINECONE_API_KEY: str

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

settings = Settings()
