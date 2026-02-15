// Se estiver rodando no computador, usa localhost.
// Se estiver na internet, usa a variável de ambiente
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";