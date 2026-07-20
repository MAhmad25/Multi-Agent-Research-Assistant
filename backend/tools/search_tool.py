from langchain.tools import tool
from tavily import TavilyClient

from keys import settings

tavily = TavilyClient(api_key=settings.TAVILY_API_KEY.get_secret_value())
print(settings)


@tool
def search_web(query: str) -> str:
    """Search the web for query which is user topic"""

    response = tavily.search(
        query=query,
        search_depth="basic",
        max_results=5,
    )

    results = []

    for i, result in enumerate(response["results"], start=1):
        results.append(
            f"""
            Search Result {i}
            Title: {result['title']}
            URL: {result['url']}
            Summary: {result['content']}
"""
        )

    return "\n".join(results)
