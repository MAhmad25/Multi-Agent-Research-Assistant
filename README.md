# Multi-Agent Research Assistant

Three agents — search, reader, critic — research a topic together. FastAPI
streams their progress live; React renders it.

```
backend/    FastAPI + your original LangChain pipeline (see backend/README.md)
frontend/   React + TypeScript + Tailwind v4 (see frontend/README.md)
```

## Run it

**Terminal 1:**
```bash
cd backend
cp .env.example .env   # add OPENROUTER_API_KEY and TAVILY_API_KEY
uv sync                # or: pip install -e .
uvicorn app.main:app --reload --port 8000
```

**Terminal 2:**
```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## What to check first

Since the agents run against real APIs (OpenRouter + Tavily) that I can't
call from here, I validated everything I could without them: the FastAPI
app boots cleanly, the SSE event pipeline was tested end-to-end with mocked
agents (correct phase/tool ordering, real LangGraph callback propagation
confirmed against your exact `create_agent` version), and the frontend
builds and lints with zero errors. The one thing I couldn't verify myself is
how your specific `openrouter/free` model behaves when it's actually
calling `search_web` / `read_webpage` — worth running one real query early
to confirm tool-call events show up as expected in the UI.
