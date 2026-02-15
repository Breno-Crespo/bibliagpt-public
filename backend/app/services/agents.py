from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.messages import SystemMessage, HumanMessage
from .rag_engine import get_retriever

# --- 1. CONFIGURAÇÃO DAS PERSONALIDADES (CÉREBROS DIFERENTES) ---
prompts_foco = {
    "Devocional": (
        "Você é uma mentora espiritual carinhosa e acolhedora. "
        "Sua linguagem deve ser poética, reconfortante e simples. "
        "Foque na aplicação pessoal, na paz interior e no amor de Deus. "
        "Evite termos técnicos teológicos difíceis. "
        "Seu objetivo principal é aquecer o coração do usuário e inspirar fé."
    ),
    "Teológico": (
        "Você é uma professora de teologia acadêmica, precisa e profunda. "
        "Foque na exegese bíblica, no contexto histórico-cultural, nos significados originais (grego/hebraico) e na doutrina sólida. "
        "Use linguagem culta e explique termos profundos. "
        "Cite referências cruzadas e conexões históricas quando possível."
    ),
    "Pastoral": (
        "Você é uma conselheira cristã experiente em vida prática, psicologia e relacionamentos. "
        "Seja empática, mas direta e orientada para a ação. "
        "Não fique apenas na teoria; foque em como aplicar princípios bíblicos para resolver conflitos reais, "
        "lidar com emoções difíceis (ansiedade, ira, luto) e tomar decisões sábias no dia a dia."
    )
}

# --- 2. SUPERVISOR (DECIDE A ROTA) ---
def get_supervisor_chain():
    # Mantemos o Llama 3 com temperatura 0 para ser preciso na decisão
    llm = ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0)
    
    system = """
    Você é um classificador de intenção. Responda APENAS com uma das palavras abaixo:
    - BIBLIA (se a pergunta for sobre versículos, doutrina, teologia ou conselho espiritual)
    - DICIONARIO (se a pergunta for pedindo o significado de uma palavra específica)
    - WEB (se for sobre fatos atuais, notícias ou algo que não está na bíblia)
    """
    return ChatPromptTemplate.from_messages([("system", system), ("human", "{input}")]) | llm | StrOutputParser()

# --- 3. AGENTE WEB (PARA COISAS ATUAIS) ---
def get_agente_web(pergunta, chat_history, foco):
    search = DuckDuckGoSearchRun()
    try:
        resultados = search.run(pergunta)
    except:
        resultados = "Sem acesso à web no momento."

    # Llama 3 (Temperatura média para criatividade controlada)
    llm = ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0.5)
    
    # Seleciona a personalidade baseada no Foco escolhido no Frontend
    # Se der erro ou não achar, usa o Devocional como padrão
    personalidade = prompts_foco.get(foco, prompts_foco["Devocional"])
    
    sys_msg = (
        f"{personalidade}\n\n"
        f"Contexto obtido da Web: {resultados}.\n"
        "Responda à dúvida do usuário com base nisso, mantendo sua personalidade cristã.\n"
        "Ao final da resposta, pule uma linha e escreva obrigatoriamente:\n"
        "'📖 **Leitura Recomendada:**' seguido de um versículo ou capítulo bíblico relacionado ao tema."
    )
    
    msgs = [SystemMessage(content=sys_msg)] + chat_history + [HumanMessage(content=pergunta)]
    return llm.invoke(msgs).content, "Web Search"

# --- 4. AGENTE RAG (ESPECIALISTA EM BÍBLIA) ---
def get_agente_rag(rota, pergunta, chat_history, foco):
    # Llama 3 (Temperatura média)
    llm = ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0.5)
    
    namespace = "dicionario_teologico" if rota == "DICIONARIO" else "biblia_sagrada"
    retriever = get_retriever(namespace)
    
    contexto = ""
    if retriever:
        try:
            docs = retriever.invoke(pergunta)
            contexto = "\n".join([d.page_content for d in docs])
        except: pass

    # Seleciona a personalidade baseada no Foco
    personalidade = prompts_foco.get(foco, prompts_foco["Devocional"])

    sys_msg = (
        f"{personalidade}\n\n"
        f"Use este contexto bíblico/teológico para embasar sua resposta: {contexto}.\n"
        "Se o contexto for insuficiente, use seu conhecimento geral, mas mantenha a fidelidade bíblica.\n"
        "Ao final da resposta, pule uma linha e escreva obrigatoriamente:\n"
        "'📖 **Leitura Recomendada:**' seguido de um versículo ou capítulo bíblico chave para o usuário meditar."
    )

    msgs = [SystemMessage(content=sys_msg)] + chat_history + [HumanMessage(content=pergunta)]
    return llm.invoke(msgs).content, "Rag Engine"