import os
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from pinecone import Pinecone

load_dotenv()

# --- VARIÁVEIS DE AMBIENTE ---
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = "bibliagpt"

print("⏳ Carregando modelos de Embedding no servidor...")
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={'device': 'cpu'} # Garante uso apenas de CPU no Render
)
print("✅ Modelos carregados com sucesso!")

def get_retriever():
    """
    Configura e retorna o recuperador (retriever) do Pinecone 
    usando os embeddings já carregados na memória.
    """
    try:
        # Inicializa o cliente Pinecone
        pc = Pinecone(api_key=PINECONE_API_KEY)
        
        # Conecta ao Vector Store existente
        vectorstore = PineconeVectorStore(
            index_name=PINECONE_INDEX_NAME,
            embedding=embeddings
        )
        
        # Retorna o retriever configurado para buscar os 3 versículos mais relevantes
        return vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 3}
        )
    except Exception as e:
        print(f"❌ Erro ao configurar o Retriever: {e}")
        return None