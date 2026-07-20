from agents.critic_agent import run_critic
from agents.reader_agent import run_reader
from agents.search_agent import run_search


def research(query: str):

    state = {
        "query": query,
        "search_results": None,
        "research_notes": [],
        "final_report": None,
    }

    # Search
    print("Search Agent Activated")
    state = run_search(state)

    # Reader
    print("Reader Agent Activated")
    state = run_reader(state)

    # Critic
    print("Final Report Activated")
    state = run_critic(state)

    return state
