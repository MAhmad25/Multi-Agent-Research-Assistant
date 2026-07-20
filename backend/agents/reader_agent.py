from agents.build_agent import build_agent
from prompts.reader_prompt import reader_prompt
from tools.reader_tool import read_webpage

agent = build_agent([read_webpage])


def run_reader(state: dict, callbacks: list | None = None) -> dict:

    messages = reader_prompt.invoke(
        {
            "query": state["query"],
            "search_results": state["search_results"],
        }
    )

    response = agent.invoke(
        {
            "messages": messages.messages
        },
        config={"callbacks": callbacks or []},
    )

    state["research_notes"] = response["messages"][-1].content

    return state
