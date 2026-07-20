from agents.build_agent import build_agent
from prompts.critic_prompt import critic_prompt

agent = build_agent([])


def run_critic(state: dict, callbacks: list | None = None) -> dict:

    messages = critic_prompt.invoke(
        {
            "query": state["query"],
            "documents": state["research_notes"],
        }
    )

    response = agent.invoke(
        {
            "messages": messages.messages
        },
        config={"callbacks": callbacks or []},
    )

    state["final_report"] = response["messages"][-1].content

    return state
