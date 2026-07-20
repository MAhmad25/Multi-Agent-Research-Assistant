from agents.build_agent import build_agent
from prompts.search_prompt import search_prompt
from tools.search_tool import search_web
from rich import print

agent = build_agent([search_web])


def run_search(state: dict, callbacks: list | None = None) -> dict:

    messages = search_prompt.invoke(
        {
            "query": state["query"]
        }
    )

    response = agent.invoke(
        {
            "messages": messages.messages
        },
        config={"callbacks": callbacks or []},
    )
    state["search_results"] = response["messages"][-1].content

    return state
