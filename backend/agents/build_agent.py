from langchain.agents import create_agent
from LLM import llm


def build_agent(tools):
    return create_agent(
        model=llm,
        tools=tools
    )
