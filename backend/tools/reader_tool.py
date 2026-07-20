from langchain.tools import tool
from bs4 import BeautifulSoup
import requests


@tool
def read_webpage(url: str) -> str:
    """
    Read a webpage and extract its main textual content.
    """

    try:
        response = requests.get(
            url,
            timeout=15,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/138.0 Safari/537.36"
                )
            },
        )

        response.raise_for_status()

        soup = BeautifulSoup(response.text, "lxml")

        for tag in soup([
            "script",
            "style",
            "noscript",
            "header",
            "footer",
            "nav",
            "aside",
            "svg",
            "form",
        ]):
            tag.decompose()

        text = soup.get_text(separator=" ", strip=True)

        lines = [line.strip() for line in text.splitlines() if line.strip()]

        cleaned_text = "\n".join(lines)

        return cleaned_text[:15000]

    except Exception as e:
        return f"Error reading webpage: {str(e)}"
