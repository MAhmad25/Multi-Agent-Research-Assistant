from langchain_openai import ChatOpenAI
from keys import settings


llm = ChatOpenAI(
    model="qwen2.5:1.5b",
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # type: ignore
    temperature=0
)

# llm = ChatOpenAI(
#     model="openrouter/auto",
#     api_key=settings.OPENROUTER_API_KEY.get_secret_value(),
#     base_url="https://openrouter.ai/api/v1",
# )
